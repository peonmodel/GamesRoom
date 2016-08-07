import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Message } from './message-server.js';

/**
 * Server-side.
 * @namespace ServerSide
 */

/**
 * @typedef ChatSchema
 * @type {Object}
 * @property {string} _id - id of chat instance
 * @property {'private'|'group'} type - type of chat TODO: more types
 * @property {string} title - name of chat
 * @property {Object[]} members - array of user/players object
 */

/**
 * @typedef Member - TODO: create Member class
 * @type {Object}
 * @property {string} _id - id of member
 * @property {string} displayName - display name
 * players may have different display name for each chat as per game requirement
 */

/**
 * @typedef MongoQuery - Mongo query object
 * @type {Object}
 * {@link https://docs.mongodb.com/manual/reference/operator/query/}
 */

/**
 * @typedef MongoCursor - Mongo collection cursor
 * @type {Object}
 * {@link https://docs.meteor.com/api/collections.html#Mongo-Collection-find}
 */

/**
 * Class representing a chat instance,
 * may create a new chat instance for each room/game/team
 * @memberof ServerSide
 */
export class Chat {

  /**
   * constructor - instantiate Chat instance
   * used to transform Chat.collection items
   * also see schema
   *
   * @param  {ChatSchema} item - object stored in collection
   */
  constructor(item){
    Object.assign(this, item);
  }

  /**
   * updateChat - update this instance of Chat and related Messages into collection
   *
   * @returns {number}  1 if successful, 0 otherwise
   */
  updateChat(){
    return Chat.collection.update(this._id, this);
  }

  /**
   * deleteChat - deletes this instance of Chat and related Messages from collection
   *
   * @returns {number}  1 if successful, 0 otherwise
   */
  deleteChat(){
    Message.collection.remove({chatId: this._id});
    return Chat.collection.remove({_id: this._id});
  }

  /**
   * joinChat - add User/Player to chat
   *
   * @param  {Member} member - member to add to chat
   * @returns {number}        new length of array
   */
  joinChat(member){
    // TODO: rather than just adding current user, allow current members to add others
    // TODO: check for member already present, do unique check 
    // TODO: some function get user/displayName from Meteor.user object
    return this.members.push(member);
  }

  /**
   * leaveChat - remove User/Player from chat
   *
   * @param  {Member} member - member to remove
   * @returns {number}        1 if successful, 0 otherwise
   */
  leaveChat(member){
    // similarly, allow kicking,
    // TODO: it should first do a find before removing
    // TODO: change to find by id of member string instead of _.isEqual
    return pull(this.members, member);
  }

  /**
   * createMessage - add a Message instance to chat
   *
   * @param  {string} text - content of message
   * @returns {string}      id of Message instance in collection
   */
  createMessage(text){
    return Message.createMessage(this._id, text);
  }
  // add people from private chat?

  /**
   * createChat - add an instance of Chat into collection
   *
   * @param  {string} [type = 'private'] - type of chat
   * @param  {string} [title = '']       - title of chat
   * @param  {Member[]} [members = []]   - members in chat
   * @returns {string}                  id of chat added to collection
   */
  static createChat(type = 'private', title = '', members = []){
    let chatId = Chat.collection.insert({
      type,
      title,
      members,
    });
    // TODO: change to system message metadata
    Message.createMessage(chatId, 'chat created');
    return chatId;
  }

  /**
   * publishChat - helper function to publish both Chat collection and Message collection
   * publishes chat by id and messages related to published chats
   *
   * @param  {MongoQuery} chatQuery    - mongo query object for Chat collection
   * @param  {MongoQuery} messageQuery - mongo query object for Message collection
   * @returns {MongoCursor[]}              array of collection cursors to publish
   */
  static publishChat(chatQuery = {}, messageQuery = {}){
    // NOTE: no need to publish composite as chatId aint going to change for a given subscription
    // if chatQuery changes, it is a new subscription and chatIds will be remapped
    // publish composite is only needed if messages depends on a field that is editable by Chat
    // such that chat cursor didnt change but messages cursor suppose to change
    // TODO: validate queries and restrict them
    // NOTE: not accepting id string as query as it should
    // be the job of the actual Meteor.publish
    // function to make the query object from string
    let chatCursor = Chat.collection.find(chatQuery);
    let chatIds = chatCursor.fetch().map(o=>o._id);
    let chatLimited = Object.assign(messageQuery, {chatId: {$in: chatIds}});
    return [
      Message.collection.find(chatLimited),
      chatCursor,
    ];
  }
}
Chat.prefix = `freelancecourtyard:chat`;
Chat.schema = {
  _id: String, // chatId
  type: String,
  title: String,
  members: [Object],  // of user
};

Chat.collection = new Mongo.Collection(`${Chat.prefix}Collection`, {
  transform: function(item){
    return new Chat(item);
  },
  defineMutationMethods: false,
});

Meteor.methods({
  /**
   * deleteChat - Meteor method to delete chat
   *
   * @param  {string} chatId - id of chat to delete
   * @returns {number}        1 if successful, 0 otherwise
   */
  [`${Chat.prefix}/deleteChat`]: function deleteChat(chatId){
    check(chatId, String);
    this.unblock();
    let chat = Chat.collection.findOne({_id: chatId});
    chat.deleteChat();
    return chat.updateChat();
  },
  /**
   * joinChat - Meteor method to join chat
   *
   * @param  {string} chatId - id of chat to join
   * @param  {Member} member - User/Player object
   * @returns {number}        1 if successful, 0 otherwise
   */
  [`${Chat.prefix}/joinChat`]: function joinChat(chatId, member){
    check(chatId, String);
    check(member, Array);
    this.unblock();
    let chat = Chat.collection.findOne({_id: chatId});
    chat.joinChat(member);
    return chat.updateChat();
  },
  /**
   * leaveChat - Meteor method to leave chat
   *
   * @param  {string} chatId - id of chat to join
   * @param  {Member} member - User/Player object
   * @returns {number}        1 if successful, 0 otherwise
   */
  [`${Chat.prefix}/leaveChat`]: function leaveChat(chatId, member){
    check(chatId, String);
    check(member, Array);
    this.unblock();
    let chat = Chat.collection.findOne({_id: chatId});
    if (chat.leaveChat(member)){
      return chat.updateChat();
    } else {
      return 0;
    }
  },
  /**
   * createMessage - Meteor method to create message
   *
   * @param  {string} chatId - id of chat to join
   * @param  {string} text - content of message
   * @returns {string}        id of created message
   */
  [`${Chat.prefix}/createMessage`]: function createMessage(chatId, text){
    check(chatId, String);
    check(text, String);
    this.unblock();
    let chat = Chat.collection.findOne({_id: chatId});
    return chat.createMessage(text);
  },
  /**
   * createChat - Meteor method to create chat
   *
   * @param  {string} [type = 'private'] - type of chat
   * @param  {string} [title = '']       - title of chat
   * @param  {Member[]} [members = []]   - members in chat
   * @returns {string}                  id of chat added to collection
   */
  [`${Chat.prefix}/createChat`]: function createChat(type, title, members){
    check(type, String);
    check(title, String);
    check(members, Array);
    this.unblock();
    return Chat.createChat(type, title, members);
  },
});

function pull(array, ...elements){
  let removeCount = 0;
  elements.forEach((element)=>{
    let idx = array.findIndex((val)=>_.isEqual(element, val));
    if (idx === -1){return;}
    array.splice(idx, 1);
    removeCount += 1;
  });
  return removeCount;
}
