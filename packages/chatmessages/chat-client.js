import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /*Match*/ } from 'meteor/check';

/**
 * Client-side.
 * @namespace ClientSide
 */

/**
 * Class representing a chat instance,
 * may create a new chat instance for each room/game/team
 * @memberof ClientSide
 */
class Chat {

  /**
   * constructor - instantiate Chat instance
   * used to transform Chat.collection items
   * also see schema
   *
   * @param  {object} item object stored in collection
   */
  constructor(item){
    Object.assign(this, item);
  }

  /**
   * deleteChat - delete this Chat instance
   *
   * @param {function} callback function to call when meteor method returns
   */
  deleteChat(callback = ()=>{}){
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/deleteChat`, this._id, callback);
  }

  /**
   * joinChat - add member to Chat instance
   *
   * @param {object} member Player/User instance to join the chat
   * @param {function} callback function to call when meteor method returns
   */
  joinChat(member, callback = ()=>{}){
    check(member, Object);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/joinChat`, this._id, member, callback);
  }

  /**
   * leaveChat - remove member to Chat instance
   *
   * @param {object} member Player/User instance to join the chat
   * @param {function} callback function to call when meteor method returns
   */
  leaveChat(member, callback = ()=>{}){
    check(member, Object);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/leaveChat`, this._id, member, callback);
  }

  /**
   * createMessage - add text to chat as a Message
   *
   * @param {string} text content of message
   * @param {function} callback function to call when meteor method returns
   */
  createMessage(text, callback = ()=>{}){
    check(text, String);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/createMessage`, this._id, text, callback);
  }

  /**
   * createChat - add an instance of Chat to collection
   * constructor is used to transform the collection, whereas this is to add a Chat to collection
   *
   * @param {string} type of chat, e.g. private, group, public, etc
   * @param {string} title title of chat
   * @param {array} members users/players in chat
   * @param {function} callback function to call when meteor method returns
   */
  static createChat(type = 'private', title = '', members = [], callback = ()=>{}){
    check(type, String);
    check(title, String);
    check(members, [String]);
    check(callback, Function);
    Meteor.call(`${Chat.prefix}/createChat`, type, title, members, callback);
  }
}
Chat.prefix = `freelancecourtyard:chat`;
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
