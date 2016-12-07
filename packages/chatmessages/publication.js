import { Meteor } from 'meteor/meteor';
import { Chat } from './chat-server.js';
import { check } from 'meteor/check';
import { Message } from './message-server.js';

// // TODO: this is an example publication, do create publication on app-level instead
// Meteor.publish('Chats', function(chatQuery, messageQuery) {
// 	check(chatQuery, Object);
// 	check(messageQuery, Object);
// 	return Chat.publishChat(chatQuery, messageQuery);
// });

Meteor.publish('RoomChat', function publishRoomChat(chatId) {
	check(chatId, String);
	return [
		Chat.collection.find({ _id: chatId }),
		Message.collection.find({ chatId }),
	];
});
