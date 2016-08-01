import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';

class Chat {
  constructor(item){
    Object.assign(this, item);
  }

  deleteChat(callback = ()=>{}){
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/deleteChat`, this._id, callback);
  }

  joinChat(member, callback = ()=>{}){
    check(member, Object);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/joinChat`, this._id, member, callback);
  }

  leaveChat(member, callback = ()=>{}){
    check(member, Object);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/leaveChat`, this._id, member, callback);
  }

  createMessage(text, callback = ()=>{}){
    check(text, String);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/createMessage`, this._id, text, callback);
  }

  static createChat(type = 'private', title = '', members = [], callback = ()=>{}){
    check(type, String);
    check(title, String);
    check(members, [String]);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/createChat`, type, title, members, callback);
  }
}
Chat.prefix = `freelancecourtyard:Chat`;
Chat.schema = {
  _id: String, // chatId
  type: String,
  title: String,
  members: [String],  // of user
};

Chat.collection = new Mongo.Collection(`${Chat.prefix}Collection`, {
  transform: function(item){
    return new Chat(item);
  },
});

export { Chat };
