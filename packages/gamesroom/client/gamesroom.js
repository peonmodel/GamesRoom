import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
// import { _ } from 'lodash';

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

export class Room {

	constructor(item) {
		Object.assign(this, item);
	}

	// async joinRoom(accessCode = '') {
	// 	check(accessCode, String);
	//   return promiseCall(Meteor.call, `${Room.prefix}/joinRoom`, this._id, accessCode);
	// }

	async leaveRoom() {
	  return promiseCall(Meteor.call, `${Room.prefix}/leaveRoom`, this._id);
	}

	async clear() {
	  return promiseCall(Meteor.call, `${Room.prefix}/clear`, this._id);
	}

	static async createRoom(isPrivate = true) {
		check(isPrivate, Boolean);
		if (!Meteor.user()) { throw new Meteor.Error(`user-not-logged-in`); }
	  return promiseCall(Meteor.call, `${Room.prefix}/createRoom`, isPrivate);
	}

	static async joinRoom(accessCode) {
		check(accessCode, String);
		if (!Meteor.user()) { throw new Meteor.Error(`user-not-logged-in`); }
		return promiseCall(Meteor.call, `${Room.prefix}/createRoom`, accessCode);
	}
}
Room.prefix = `freelancecourtyard:room`;
Room.schema = {
	_id: String,
	title: String,
	accessCode: String,  // for access to private room, also server as shortened id
	isPublic: Boolean,
	capacity: Match.Integer,
	members: [String],
	games: [String],
	chatId: String,
};
Room.collection = new Mongo.Collection(`${Room.prefix}Collection`, {
	transform: function(item) {
	  return new Room(item);
	},
});
