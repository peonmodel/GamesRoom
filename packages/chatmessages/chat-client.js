import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Message } from './message-client.js';

/**
 * promiseCall - function to wrap async Meteor functions into returning promises
 *
 * @param  {Function} fn - async function to wrap
 * @param  {Array} params - array of params
 * @returns {Promise}           resolve if success
 */
function promiseCall(fn, ...params) {
	return new Promise((resolve, reject) => {
		fn(...params, (err, res) => {
			if (err) { return reject(err); }
			return resolve(res);
		});
	});
}

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
	constructor(item) {
	  Object.assign(this, item);
	}

	/**
	 * deleteChat - delete this Chat instance
	 *
	 * @returns {Promise} - a promise, 1 if successful
	 */
	async deleteChat() {
		return promiseCall(Meteor.call, `${Chat.prefix}/deleteChat`, this._id);
	}

  /**
   * joinChat - add member to Chat instance
   *
   * @param {object} member Player/User instance to join the chat
   * @returns {Promise} - a promise, 1 if successful
   */
	async joinChat(member) {
	  check(member, Object);
		return promiseCall(Meteor.call, `${Chat.prefix}/joinChat`, this._id, member);
	}

  /**
   * leaveChat - remove member to Chat instance
   *
   * @param {object} member Player/User instance to join the chat
   * @returns {Promise} - a promise, 1 if successful
   */
	async leaveChat(member) {
	  check(member, Object);
		return promiseCall(Meteor.call, `${Chat.prefix}/leaveChat`, this._id, member);
	}

  /**
   * createMessage - add text to chat as a Message
   *
   * @param {string} text content of message
   * @returns {Promise} - a promise, 1 if successful
   */
	async createMessage(text) {
	  check(text, String);
		return promiseCall(Meteor.call, `${Chat.prefix}/createMessage`, this._id, text);
	}

  /**
   * createChat - add an instance of Chat to collection
   * constructor is used to transform the collection, whereas this is to add a Chat to collection
   *
   * @param {string} type of chat, e.g. private, group, public, etc
   * @param {string} title title of chat
   * @param {array} members users/players in chat
   * @returns {Promise} - a promise, 1 if successful
   */
	static async createChat(type = 'private', title = '', members = []) {
	  check(type, String);
	  check(title, String);
	  check(members, [String]);
	  return promiseCall(Meteor.call, `${Chat.prefix}/createChat`, type, title, members);
	}

	/**
	 * message - a getter to get the array of messages associated with chat
	 *
	 * @readonly
	 *
	 * @memberOf Chat
	 */
	get messages() {
		return Message.collection.find({ chatId: this._id }).fetch();
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
	transform: function(item) {
	  return new Chat(item);
	},
});

export { Chat };
