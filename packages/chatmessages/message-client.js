import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';

// client-side
class Message {

  constructor(item){
    Object.assign(this, item);
  }

  deleteMessage(callback = ()=>{}){
    check(callback, Function);
    Meteor.call(`${Message.prefix}/deleteMessage`, this._id, callback);
  }

  editMessage(text, callback = ()=>{}){
    check(text, String);
    check(callback, Function);
    Meteor.call(`${Message.prefix}/editMessage`, this._id, text, callback);
  }

  replyMessage(text, callback = ()=>{}){
    check(text, String);
    check(callback, Function);
    Meteor.call(`${Message.prefix}/replyMessage`, this._id, text, callback);
  }

  static createMessage(chatId, text, replyTo, callback = ()=>{}){
    check(chatId, String);
    check(text, String);
    check(replyTo, Object);
    check(callback, Function);
    Meteor.call(`${Message.prefix}/createMessage`, chatId, text, replyTo, callback);
  }
}
Message.schema = {
  _id: String,  // id of message
  chatId: String,  // id of chat it belongs to
  from: {
    // user
    _id: String,
    displayName: String,  // this may be different from userId name
  },
  timestamp: Date,
  text: String,  // NOTE: main thing

  // optional stuff

  // NOTE: rather than materializing it, might as well save a copy
  replyTo: {
    _id: String,
    from: {},
    text: String,
    timestamp: Date,
  },  // id of message replied to
  // forwardFrom: String,  // id of forwarded message
  editAt: Date,  // optional
  // contain things like special parse instruction for system message
  // system message can be member join, left, chat created
  metadata: Object,
  // audio: Object,
  // document: Object,
  // photo: Object,
  // video: Object,
  // caption: String,
  // contact: Object,
  // location: Object,
};
Message.prefix = `freelancecourtyard:Message`;

/* global MessageCollection: true*/
MessageCollection = new Mongo.Collection(`${Message.prefix}Collection`, {
  transform: function(item){
    return new Message(item);
  },
});

export { Message, MessageCollection };
