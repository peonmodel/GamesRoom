import { Meteor } from 'meteor/meteor';

import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';

/* global _Chat: true */
/* global _Message: true */
if (Meteor.isDevelopment){
  _Chat = Chat;
  _Message = Message;
}

Meteor.startup(() => {
  // code to run on server at startup
});
