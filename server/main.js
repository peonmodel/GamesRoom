import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
import { Connection } from 'meteor/freelancecourtyard:connection';
import { Room } from 'meteor/freelancecourtyard:gamesroom';

/* global _Chat: true */
/* global _Message: true */
/* global _Connection: true */
/* global _Room: true */
if (Meteor.isDevelopment) {
	_Chat = Chat;
	_Message = Message;
	_Connection = Connection;
	_Room = Room;
}

Meteor.startup(() => {
  // code to run on server at startup
	if (Meteor.isDevelopment) {
		Meteor.methods({
			'clearAll': function() {
				Connection.collection.remove({});
				Chat.collection.remove({});
				Message.collection.remove({});
				Accounts.users.remove({});
				console.log('all cleared');
			},
		});
	}
});
