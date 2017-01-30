import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { GenericGame } from 'meteor/freelancecourtyard:genericgame';
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

class RoomGame {
	constructor(item, room) {
		Object.assign(this, item);
		this._room = room;
		Object.defineProperty(this, '_room', { enumerable: false });
		this._materialised = undefined;
		Object.defineProperty(this, '_materialised', { enumerable: false });
	}

	get materialised() {
		if (!this._materialised) {
			this._materialised = GenericGame.collection.findOne(this._id);
		}
		return this._materialised;
	}
}

export class Room {

	constructor(item) {
		Object.assign(this, item);
		this.games = this.games.map(game => new RoomGame(game, this));
	}

	async joinRoom(accessCode = '') {
		check(accessCode, String);
	  return promiseCall(Meteor.call, `${Room.prefix}/joinRoom`, this._id, accessCode);
	}

	async leaveRoom() {
	  return promiseCall(Meteor.call, `${Room.prefix}/leaveRoom`, this._id);
	}

	async clear() {
	  return promiseCall(Meteor.call, `${Room.prefix}/clear`, this._id);
	}

	async updateGameList(gameId, type) {
		check(gameId, String);
		check(type, String);
		return promiseCall(Meteor.call, `${Room.prefix}/updateGameList`, this._id, gameId, type);
	}

	static async createRoom(isPrivate = true) {
		check(isPrivate, Boolean);
		if (!Meteor.user()) { throw new Meteor.Error(`user-not-logged-in`); }
	  return promiseCall(Meteor.call, `${Room.prefix}/createRoom`, isPrivate);
	}

	static async findRoomsByCode(accessCode) {
		check(accessCode, String);  // publication of rooms exclude access code, not possible to search on client side
		if (!Meteor.user()) { throw new Meteor.Error(`user-not-logged-in`); }
		const rooms = await promiseCall(Meteor.call, `${Room.prefix}/findRoomsByCode`, accessCode);
		return rooms.map(room => { return new Room(room); });
	}
}
Room.prefix = `freelancecourtyard:gamesroom`;
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
