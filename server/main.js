import { Meteor } from 'meteor/meteor';

import { Chat, ChatCollection, Message, MessageCollection } from 'meteor/freelancecourtyard:chatmessages';

/* global _Chat: true */
/* global _ChatCollection: true */
/* global _Message: true */
/* global _MessageCollection: true */
if (Meteor.isDevelopment){
  _Chat = Chat;
  _ChatCollection = ChatCollection;
  _Message = Message;
  _MessageCollection = MessageCollection;
}

Meteor.startup(() => {
  // code to run on server at startup
});
