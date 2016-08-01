import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';
// import { _ } from 'meteor/underscore';

import { Message } from './message-server.js';

class Chat {
  // NOTE: a different chat is created for each room, game, teams
  constructor(item){
    Object.assign(this, item);
  }

  deleteChat(){
    Message.collection.remove({chatId: this._id});
    return Chat.collection.remove({_id: this._id});
  }

  joinChat(member){
    // rather than just adding current user, allow current members to add others
    // TODO: some function get user/displayName from Meteor.user object
    return Chat.collection.update(this._id, {
      $push: {members: member},
    });
  }

  leaveChat(member){
    // similarly, allow kicking
    return Chat.collection.update(this._id, {
      $pull: {members: member},
    });
  }

  createMessage(text){
    return Message.createMessage(this._id, text);
  }
  // add people from private chat?

  static createChat(type = 'private', title = '', members = []){
    let chatId = Chat.collection.insert({
      type,
      title,
      members,
    });
    Message.createMessage(chatId);
  }

  static publishChat(chatQuery, messageQuery){
    // NOTE: no need to publish composite as chatId aint going to change for a given subscription
    // if chatQuery changes, it is a new subscription and chatIds will be remapped
    // publish composite is only needed if messages depends on a field that is editable by Chat
    // such that chat cursor didnt change but messages cursor suppose to change
    let chatCursor = Chat.collection.find(chatQuery);
    let chatIds = chatCursor.fetch().map(o=>o._id);
    let chatLimited = Object.assign(messageQuery, {chatId: {$in: chatIds}});
    return [
      Message.collection.find(chatLimited),
      chatCursor,
    ];
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
  defineMutationMethods: false,
});

Meteor.methods({
  [`${Chat.prefix}/deleteChat`]: function deleteChat(chatId){
    check(chatId, String);
    let chat = Chat.collection.findOne({_id: chatId});
    return chat.deleteChat();
  },
  [`${Chat.prefix}/joinChat`]: function joinChat(chatId, member){
    check(chatId, String);
    check(member, Array);
    let chat = Chat.collection.findOne({_id: chatId});
    return chat.joinChat(member);
  },
  [`${Chat.prefix}/leaveChat`]: function leaveChat(chatId, member){
    check(chatId, String);
    check(member, Array);
    let chat = Chat.collection.findOne({_id: chatId});
    return chat.leaveChat(member);
  },
  [`${Chat.prefix}/createMessage`]: function createMessage(chatId, text){
    check(chatId, String);
    check(text, String);
    let chat = Chat.collection.findOne({_id: chatId});
    return chat.createMessage(text);
  },
  [`${Chat.prefix}/createChat`]: function createChat(type, title, members){
    check(type, String);
    check(title, String);
    check(members, Array);
    return Chat.createChat(type, title, members);
  },
});

export { Chat };
