import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Room } from './gamesroom.js';

Meteor.methods({
	[`${Room.prefix}/joinRoom`]: function(roomId, accessCode) {
		check(roomId, String);
		check(accessCode, String);
		const room = Room.collection({ _id: roomId });
		if (!room) {
			throw new Meteor.Error(`room-not-found`);
		}
		return room.joinRoom(Meteor.user());
	},
	[`${Room.prefix}/leaveRoom`]: function(roomId) {
		check(roomId, String);
		const room = Room.collection({ _id: roomId });
		if (!room) {
			throw new Meteor.Error(`room-not-found`);
		}
		return room.leaveRoom(Meteor.user());
	},
	[`${Room.prefix}/createRoom`]: function(isPrivate) {
		check(isPrivate, Boolean);
		return Room.createRoom(Meteor.user(), isPrivate);
	},
	[`${Room.prefix}/findRoomsByCode`]: function(accessCode) {
		check(accessCode, String);
		// TODO: specifically rate limit this
		return Room.findRoomsByCode(Meteor.user(), accessCode);
	},
});
