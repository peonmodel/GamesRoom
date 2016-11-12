import { Meteor } from 'meteor/meteor';
import { Chat } from './chat-server.js';
import { check, /*Match*/ } from 'meteor/check';

// TODO: this is an example publication, do create publication on app-level instead
Meteor.publish('Chats', function(chatQuery, messageQuery) {
  check(chatQuery, Object);
  check(messageQuery, Object);
  return Chat.publishChat(chatQuery, messageQuery);
});
