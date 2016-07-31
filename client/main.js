import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

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

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
