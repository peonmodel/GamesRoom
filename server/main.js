import { Meteor } from 'meteor/meteor';

import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
import { ConnectionCollection } from 'meteor/freelancecourtyard:connection';

/* global _Chat: true */
/* global _Message: true */
/* global _ConnectionCollection: true */
if (Meteor.isDevelopment){
  _Chat = Chat;
  _Message = Message;
	_ConnectionCollection = ConnectionCollection;
}

Meteor.startup(() => {
  // code to run on server at startup
});
