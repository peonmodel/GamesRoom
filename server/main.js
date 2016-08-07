import { Meteor } from 'meteor/meteor';

import { Chat, Message } from 'meteor/freelancecourtyard:chatmessages';
import { Task } from 'meteor/freelancecourtyard:task';

/* global _Chat: true */
/* global _Message: true */
/* global _Task: true */
if (Meteor.isDevelopment){
  _Chat = Chat;
  _Message = Message;
  _Task = Task;
}

Meteor.startup(() => {
  // code to run on server at startup
});
