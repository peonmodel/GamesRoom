// import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

/* global MessageCollection: true */
/* global ChatCollection: true */

// NOTE: https://docs.mongodb.com/manual/core/index-intersection/
// NOTE: https://jira.mongodb.org/browse/SERVER-3071
// NOTE: https://docs.mongodb.com/manual/core/index-compound/
// TL;DR index intersection only works with 2 indices,
// compound indices are still faster and is preferred
// put high cardinality fields first and progressively lower up to 31
// compound indices also work for its prefixes, i.e. {a, b, c} works for {a, b} too
MessageCollection = new Mongo.Collection('Messsages', {
  transform: function(item){
    return new Message(item);
  },
  defineMutationMethods: false,  // need to publish this but dont let direct edit
});
// sort index only matter when both fields need to be sorted
MessageCollection._ensureIndex({chatId: 1, timestamp: 1});

ChatCollection = new Mongo.Collection('Chats', {
  transform: function(item){
    return new Chat(item);
  },
  defineMutationMethods: false,
});

class Message {

  constructor(item){
    Object.assign(this, item);
  }

  // NOTE: https://core.telegram.org/bots/api#message
  get schema(){
    return {
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
  }

  /**
   * deleteMessage - delete message from collection
   *
   * @returns {number}  1 if succeeded, 0 otherwise
   */
  deleteMessage(){
    return MessageCollection.remove({_id: this._id});
  }

  /**
   * editMessage - delete message from collection
   *
   * @param {string} text edited text
   * @returns {number}  1 if succeeded, 0 otherwise
   */
  editMessage(text){
    return MessageCollection.update(this._id, {
      $set: {text: text, editAt: new Date()}
    });
  }

  /**
   * replyMessage - create a reply to message
   *
   * @param {string} text reply content
   * @returns {string}  id of new reply message
   */
  replyMessage(text){
    return Message.createMessage(this.chatId, text, this);
  }

  /**
   * createMessage - static class function to create message
   *
   * @param  {string} chatId  id of chat message belongs to
   * @param  {string} text    content of message
   * @param  {object} replyTo optional Message object that is being replied to
   * @returns {string}         id of created message
   */
  static createMessage(chatId, text, replyTo){
    // TODO: filter replyTo object to contain only essentials
    let filteredReply = !!replyTo ? _.pick(replyTo, ['_id', 'from', 'text', 'timestamp']) : undefined;
    return MessageCollection.insert({
      chatId,
      from: {}, // TODO: filter Meteor.user chat name somehow
      text,
      timestamp: new Date(),
      replyTo: filteredReply,
    });
  }

}

class Chat {
  // NOTE: a different chat is created for each room, game, teams
  constructor(item){
    Object.assign(this, item);
  }

  get schema(){
    return {
      _id: String, // chatId
      type: String,
      title: String,
      members: [String],  // of user
    };
  }

  deleteChat(){
    MessageCollection.remove({chatId: this._id});
    return ChatCollection.remove({_id: this._id});
  }

  joinChat(member){
    // rather than just adding current user, allow current members to add others
    // TODO: some function get user/displayName from Meteor.user object
    return ChatCollection.update(this._id, {
      $push: {members: member},
    });
  }

  leaveChat(member){
    // similarly, allow kicking
    return ChatCollection.update(this._id, {
      $pull: {members: member},
    });
  }

  static createChat(type = 'private', title = '', members = []){
    let chatId = ChatCollection.insert({
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
    let chatCursor = ChatCollection.find(chatQuery);
    let chatIds = chatCursor.fetch().map(o=>o._id);
    let chatLimited = Object.assign(messageQuery, {chatId: {$in: chatIds}});
    return [
      MessageCollection.find(chatLimited),
      chatCursor,
    ];
  }
}

export { Chat, ChatCollection, Message, MessageCollection };
