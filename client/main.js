import { Meteor } from 'meteor/meteor';
// import './main.html';

import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
import { Connection } from 'meteor/freelancecourtyard:connection';
// import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { GenericGame } from 'meteor/freelancecourtyard:genericgame';
import { CodeNames } from 'meteor/freelancecourtyard:codenames';

/* global _Chat: true */
/* global _Message: true */
/* global _Connection: true */
if (Meteor.isDevelopment) {
	_Chat = Chat;
	_Message = Message;
	_Connection = Connection;
}

Meteor.startup(() => {
	GenericGame.registerGame('CodeNames', CodeNames);
});
