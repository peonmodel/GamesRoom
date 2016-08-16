import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { taskStates, taskStatesArray } from '../imports/taskstates.js';

// private scoped variable
const registeredPackages = {
  default: {
    // Task events
    onCreated: function onCreated(/*taskId*/){},  // no binding to 'this'

    // state change events
    onCancelled: function onCancelled(){},
    onReset: function onReset(){},
    onReadyStart: function onReadyStart(){},  // 'this' will be bound to task
    onStart: function onStart(){},
    onReadyComplete: function onReadyComplete(){},
    onCompleted: function onCompleted(){},
    onError: function onError(){},

    // others
    onProgressUpdate: function onProgressUpdate(){},
    completionCriteria: function completionCriteria(){return true;},
  },
};
const eventList = Object.keys(registeredPackages.default);
Object.freeze(registeredPackages.default);

export class Task {

  constructor(item){
    Object.assign(this, item);
  }

  static get TaskStates(){
    // cannot be modified
    return taskStates;
  }

  static get ReadableStates(){
    return taskStatesArray;
  }

  static publishTask(query = {}){
    return Task.collection.find(query);
  }

  static registerPackage(key, obj){
    // validate obj
    if (registeredPackages[key]){
      throw new Meteor.Error(`${key} is already registered`);
    }
    registeredPackages[key] = _.reduce(eventList, (memo, fnName)=>{
      if (!_.isFunction(obj[fnName])){
        memo[fnName] = registeredPackages.default[fnName];
      } else {
        memo[fnName] = obj[fnName];
      }
      return memo;
    }, {});
  }

  static createTask({
    _id, registeredType,
    state: state = Task.TaskStates.notReady,
    progress,
    taskInfo,
    changelog: changelog = [],
  } = {}){
    if (!registeredPackages[registeredType]) {
      throw new Meteor.Error(`${registeredType} not registered in Task`);
    }
    check(progress, {
      completedCount: Match.Maybe(Match.Integer),
      totalCount: Match.Maybe(Match.Integer),
    });
    progress.completedCount = progress.completedCount || 0;
    progress.totalCount = progress.totalCount || 1;
    let taskId = Task.collection.insert({
      _id, registeredType, state, progress, taskInfo, changelog,
    });
    registeredPackages[registeredType].onCreated(taskId);
    return taskId;
  }

  deleteTask(){
    // is internal server method, use cancelTask for meteor methods
    return Task.collection.remove({_id: this._id});
  }

  updateTask(){
    if (!this.changed) {return 0;}
    delete this.changed;
    return Task.collection.update(this._id, this);
  }

  recordLog(action, params = [], timestamp = new Date()){
    this.changed = true;
    return this.changelog.push({
      action, params, timestamp,
    });
  }

  completeTask(){
    let fn = registeredPackages[this.registeredType].completionCriteria;
    let fulfilled = !!(fn.apply(this));
    if (fulfilled){
      this.currentState = Task.TaskStates.isCompleted.code;
      return true;
    } else {
      return false;
    }
  }

  updateProgress(int = 1){
    if (this.progress.completedCount + int > this.progress.totalCount ){
      throw new Meteor.Error(`exceed total count`);
    }
    this.progress.completedCount += int;
    this.recordLog('updateProgress', [int]);
    if (this.progress.completedCount > 0 && !this.isInProgress){
      this.currentState = Task.TaskStates.inProgress.code;
    }
    // call onProgressUpdate
    let fn = registeredPackages[this.registeredType].onProgressUpdate;
    fn.call(this, int);
    return this.progress.completedCount;
  }

  reassignTask(id){
    this.assignedTo = id;
    this.recordLog('reassignTask', [id]);
    // call onReassign
    return id;
  }

  executeTask(...params){
    let fn = get(Task, `registeredPackages.${this.registeredType}.execute`);
    if (_.isFunction(fn)){
      this.recordLog('executeTask', params);
      return fn.apply(this, params);
    }
  }

  get currentState(){
    // return as readable string instead of code
    return Task.ReadableStates[this.state];
  }

  set currentState(state){
    // either string or state code
    const stateEvents = {
      '0': 'onCancelled',
      '1': 'onReset',
      '2': 'onReadyStart',
      '3': 'onStart',
      '4': 'onReadyComplete',
      '5': 'onCompleted',
      '6': 'onError',
    };
    const stringToCode = _.invert(Task.ReadableStates);
    let param = state;  // for logging purpose
    if (_.isString(state)){state = stringToCode[state];}
    if (_.isNumber(state) && !!Task.ReadableStates[state]){state = undefined;}
    if (_.isUndefined(state)){
      console.warn('invalid state');
      return;
    }
    if (this.state !== state){
      this.state = state;
      this.recordLog('setstate', [param]);
      let fn = registeredPackages[this.registeredType][stateEvents[this.state]];
      fn.call(this);
    }
  }

  get isCancelled(){
    return this.state === Task.TaskStates.isCancelled.code;
  }

  get isNotReady(){
    return this.state === Task.TaskStates.notReady.code;
  }

  get isReadyStart(){
    return this.state === Task.TaskStates.readyStart.code;
  }

  get isInProgress(){
    return this.state === Task.TaskStates.inProgress.code;
  }

  get isReadyComplete(){
    return this.state === Task.TaskStates.readyComplete.code;
  }

  get isCompleted(){
    return this.state === Task.TaskStates.isCompleted.code;
  }

  get isError(){
    return this.state === Task.TaskStates.hasError.code;
  }

}
Task.prefix = `freelancecourtyard:task`;
// TODO: more schema, create task and ensure index
Task.schema = {
  _id: String,
  registeredType: String,
  state: Number,
  progress: {
    completedCount: Number,
    totalCount: Number,
  },
  taskInfo: Object,
  changelog: {
    action: String,
    params: Array,
    timestamp: Date,
  },
};
Task.collection = new Mongo.Collection(`${Task.prefix}Collection`, {
  transform: function(item){
    return  new Task(item);
  },
  defineMutationMethods: false,
});
// Task.collection._ensureIndex();

// TODO: register
Task.registerPackage('Task', {
  execute: function execute(...params){
    console.log('execute', this, params);
  },
});

Meteor.methods({
  [`${Task.prefix}/requestReassignment`]: function requestReassignment(){

  },
  [`${Task.prefix}/acceptReassignment`]: function acceptReassignment(){

  },
  [`${Task.prefix}/approveReassignment`]: function approveReassignment(){

  },
  [`${Task.prefix}/createTask`]: function createTask(){

  },
  [`${Task.prefix}/updateProgress`]: function updateProgress(taskId, increment){
    check(taskId, String);
    check(increment, Match.Integer);
    let task = Task.collection.findOne({_id: taskId});
    let result = task.updateProgress(increment);  // will throw if exceed
    task.updateTask();  // save changes
    return result;
  },
});

/**
 * get - helper function to get value in deeply nested objects
 *
 * @param  {object} obj       object to get value from
 * @param  {string|array} ...params combination of strings and arrays to navigate to value
 * @returns {*}           value to get
 */
function get (obj, ...params) {
  function getObject(object, path){
    if (_.isUndefined(object)){return undefined;}
    if (!_.isEmpty(path)){
      let cur = path.shift(1);
      return getObject(object[cur], path);
    }
    return object;
  }

  let path = _.flatten(params)
              .filter(val=>_.isString(val) || _.isNumber(val))
              .map(val=> val.toString().split(/\.|\[|\]|,/g));
  path = _.flatten(path).filter(val=>!!val);
  return getObject(obj, path);
}
