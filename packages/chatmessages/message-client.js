import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, /* Match */ } from 'meteor/check';

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
 * class representing a message instance
 * intended to be used in Chat
 */
class Message {

	/**
	 * constructor - instantiate Message instance
	 * used to transform Message.collection items
	 * also see schema
	 *
	 * @param  {object} item object stored in collection
	 */
	constructor(item) {
		Object.assign(this, item);
	}

	/**
	 * deleteMessage - delete this Message instance
	 *
	 * @return {Promise} - resolve to 1 if update success
	 */
	async deleteMessage() {
		return promiseCall(Meteor.call, `${Message.prefix}/deleteMessage`, this._id);
	}

	/**
	 * editMessage - edit text content of this Message instance
	 *
	 * @param {string} text new content of Message
	 * @returns {Promise} - resolve to 1 if update success
	 */
	async editMessage(text, ) {
		check(text, String);
		return promiseCall(Meteor.call, `${Message.prefix}/editMessage`, this._id, text);
	}

	/**
	 * replyMessage - create a Message instance as reply to another Message instance
	 *
	 * @param {string} text content of reply Message
	 * @returns {Promise} - resolve to 1 if update success
	 */
	async replyMessage(text, ) {
		check(text, String);
		return promiseCall(Meteor.call, `${Message.prefix}/replyMessage`, this._id, text);
	}

	/**
	 * createMessage - add an instance of Message to collection
	 * constructor is used to transform the collection, whereas this is to add a Message to collection
	 *
	 * @param {string} chatId id of chat Message belongs to
	 * @param {string} text content of Message
	 * @param {Message} replyTo Message object that is being replied to
	 * @returns {Promise} - resolve to 1 if update success
	 */
	static async createMessage(chatId, text, replyTo, ) {
		check(chatId, String);
		check(text, String);
		check(replyTo, Object);
		return promiseCall(Meteor.call, `${Message.prefix}/createMessage`, chatId, text, replyTo);
	}
}
Message.schema = {
	_id: String,  // id of message
	// roomId: String,
	// gameId: String,
	// teamId: String,
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
Message.prefix = `freelancecourtyard:message`;

Message.collection = new Mongo.Collection(`${Message.prefix}Collection`, {
	transform: function(item) {
		return new Message(item);
	},
});

export { Message };
