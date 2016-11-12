import { Meteor } from 'meteor/meteor';
import './main.html';

import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
import { Connection } from 'meteor/freelancecourtyard:connection';

/* global _Chat: true */
/* global _Message: true */
/* global _Connection: true */
if (Meteor.isDevelopment) {
	_Chat = Chat;
	_Message = Message;
	_Connection = Connection;
}

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
