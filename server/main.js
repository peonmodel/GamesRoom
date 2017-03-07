import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
import { Connection } from 'meteor/freelancecourtyard:connection';
import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { GenericGame } from 'meteor/freelancecourtyard:genericgame';
import { CodeNames } from 'meteor/freelancecourtyard:codenames';

/* global _Chat: true */
/* global _Message: true */
/* global _Connection: true */
/* global _Room: true */
/* global _CodeNames: true */
if (Meteor.isDevelopment) {
	_Chat = Chat;
	_Message = Message;
	_Connection = Connection;
	_Room = Room;
	_CodeNames = CodeNames;
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
				Room.collection.remove({});
				GenericGame.collection.remove({});
				console.log('all cleared');
			},
		});
	}
	// GenericGame.registerGame('CodeNames', CodeNames);
});
