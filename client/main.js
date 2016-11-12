import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
import { ConnectionCollection } from 'meteor/freelancecourtyard:connection';

/* global _Chat: true */
/* global _Message: true */
/* global _ConnectionCollection: true */
if (Meteor.isDevelopment) {
	_Chat = Chat;
	_Message = Message;
	_ConnectionCollection = ConnectionCollection;
}

Template.Connections.onCreated(function() {
	console.log(this);
});

Template.Connections.helpers({
	getUsers() {
		return ConnectionCollection.find().map((user) => {
			return { display: user.userId, active: true };
		});
	},
});

// Template.Connections.events({
// 	'something': async function test(event, instance) {
// 		event.preventDefault();
// 		try {
// 			let x = instance.data.something.asyncFn();
// 			console.log(x);
// 		} catch (e) {
// 			console.error(e);
// 		} finally {
// 			console.log('finally');
// 		}
//
// 	},
// });

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
	this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
	counter() {
		return Template.instance().counter.get();
	},
});

Template.hello.events({
	'click button'(event, instance) {
    // increment the counter when button is clicked
		instance.counter.set(instance.counter.get() + 1);
	},
});
