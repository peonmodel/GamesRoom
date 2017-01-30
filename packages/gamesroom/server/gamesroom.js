import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Chat } from 'meteor/freelancecourtyard:chatmessages';
import { GenericGame } from 'meteor/freelancecourtyard:genericgame';
// import { _ } from 'lodash';

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

	joinRoom(user) {
		if (this.members.includes(user._id)) { return 1; }  // already inside
		if (this.capacity < this.members.length + 1) {
			throw new Meteor.Error(`room-full`);
		}
	  return Room.collection.update({ _id: this._id }, {
	    $push: { members: user._id },
	  });
	}

	leaveRoom(user) {
		if (this.members.length <= 1) {
			return this.clear();  // clear room instead if last person left
		}
	  return Room.collection.update({ _id: this._id, members: user._id }, {
	    $pull: {members: user._id},
	  });
	}

	clear() {
	  // will be called before deconstructing room
	  // TODO: clear members
	  // TODO: clear games
	  // clear room chat
		const chat = Chat.collection.findOne({_id: this.chatId});
	  chat.clear();
	  return Room.collection.remove({_id: this._id});
	}

	/**
	 * _materialiseGames - materialise all the games in one go to avoid multiple queries
	 * purely server-side function since multiple queries isnt a problem client-side
	 * @static
	 * @param {RoomGame[]} [array=[]] - array to materialise
	 * @returns {undefined} - no return value
	 * 
	 * @memberOf Room
	 */
	static _materialiseGames(array = []) {
		const query = array.map(o => o._id);
		const games = GenericGame.collection.find({ _id: { $in: query } }).fetch();
		array.forEach(game => { game._materialised = games.find(o => o._id === game._id); });
	}

	static findRoomsByCode(user, accessCode) {
		if (!accessCode) { return []; }
		return Room.collection.find({ accessCode }, { 
			fields: { members: 0, accessCode: 0 } 
		}).fetch();
	}

	static createRoom(user, isPrivate = false) {
	  const title = `Room-${Random.id(4)}`;
		const members = [user._id];
		return Room.collection.insert({
	  	title,
	    accessCode: isPrivate ? Random.id(6) : '',
	    isPublic: !isPrivate,
	    capacity: 15,
	    members: members,
	    games: [],
	    chatId: Chat.createChat('group', `Chat for ${title}`, members),
			createdAt: new Date(),
	  });
	}

	updateGameList(gameId, type) {
		this.games.unshift(new RoomGame({ _id: gameId, type }, this));
		Room._materialiseGames(this.games);
		this.games = this.games.filter(o => !!o._materialised);
		return Room.collection.update(this._id, {
			$set: { games: this.games },
		});
	}

	// static publishRoom(roomQuery, chatQuery, messageQuery) {
	// 	// publication of rooms exclude accessCode
	//   const roomCursor = Room.collection.find(roomQuery);
	//   const chatIds = roomCursor.map(o => o.chatId);
	//   const roomLimited = Object.assign(chatQuery, {_id: {$in: chatIds}});
	//   const chatmessageCursors = Chat.publishChat(roomLimited, messageQuery);
	//   return [
	//     ...chatmessageCursors,
	//     roomCursor,
	//   ];
	// }

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
	defineMutationMethods: false,
});
