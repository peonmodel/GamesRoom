import { _ } from 'meteor/underscore';

const taskStates = {
	isCancelled: {code: 0, text: 'cancelled'},
	notReady: {code: 1, text: 'not ready'},
	readyStart: {code: 2, text: 'ready to start'},
	inProgress: {code: 3, text: 'in progress'},
	readyComplete: {code: 4, text: 'ready to complete'},
	isCompleted: {code: 5, text: 'completed'},
	hasError: {code: 6, text: 'error'},
};
Object.freeze(taskStates);

const taskStatesArray = _.map(taskStates, ({text})=>{
  return text;
});
Object.freeze(taskStatesArray);

export { taskStates, taskStatesArray };
