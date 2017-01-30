import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Room } from './gamesroom.js';

Meteor.methods({
	[`${Room.prefix}/joinRoom`]: function(roomId, accessCode) {
		check(roomId, String);
		check(accessCode, String);
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('user-not-logged-in'); }
		const room = Room.collection.findOne({ _id: roomId });
		if (!room) {
			throw new Meteor.Error(`room-not-found`);
		}
		if (room.accessCode !== accessCode) {
			throw new Meteor.Error(`incorrect-access-code`);
		}
		return room.joinRoom(user);
	},
	[`${Room.prefix}/leaveRoom`]: function(roomId) {
		check(roomId, String);
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('user-not-logged-in'); }
		const room = Room.collection.findOne({ _id: roomId });
		if (!room) {
			throw new Meteor.Error(`room-not-found`);
		}
		return room.leaveRoom(user);
	},
	[`${Room.prefix}/createRoom`]: function(isPrivate) {
		check(isPrivate, Boolean);
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('user-not-logged-in'); }
		return Room.createRoom(user, isPrivate);
	},
	[`${Room.prefix}/findRoomsByCode`]: function(accessCode) {
		check(accessCode, String);
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('user-not-logged-in'); }
		// TODO: specifically rate limit this,
		// alternatively, make this publish, but rate limit it too
		return Room.findRoomsByCode(user, accessCode);
	},
	[`${Room.prefix}/updateGameList`]: function updateGameList(roomId, gameId, type) {
		check(roomId, String);
		check(gameId, String);
		check(type, String);
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('user-not-logged-in'); }
		const room = Room.collection.findOne({ _id: roomId });
		if (!room) {
			throw new Meteor.Error(`room-not-found`);
		}
		return room.updateGameList(gameId, type);
	},
});
