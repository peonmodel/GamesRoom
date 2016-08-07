import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';

export class Task {
  constructor(item){
    Object.assign(item);
  }

  static createTask(callback = ()=>{}){
    // check input
    check(callback, Function);
    Meteor.call(`${Task.prefix}/createTask`, callback);
  }
}
Task.prefix = `freelancecourtyard:task`;
Task.schema = {

};
Task.collection = new Mongo.Collection(`${Task.prefix}Collection`, {
  transform: function(item){
    return new Task(item);
  },
});
