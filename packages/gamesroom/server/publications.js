import { Meteor } from 'meteor/meteor';
import { Room } from './gamesroom.js';
import { check } from 'meteor/check';
import { GenericGame } from 'meteor/freelancecourtyard:genericgame';
// import { Chat } from 'meteor/freelancecourtyard:chatmessages';

// publication for all rooms that are public
Meteor.publish('PublicRooms', function publishPublic() {
	return Room.collection.find({ isPublic: true }, {
		fields: { members: 0, accessCode: 0 },
	});
});

// publication for all rooms user has joined (as part of a list)
// joining a room is different from being INSIDE a room
Meteor.publish('ActiveRooms', function publishActive() {
	return Room.collection.find({ members: this.userId }, {
		fields: { members: 0, accessCode: 0 },
	});
});

// publication for the current room user is at/inside of
// includes room chat, other members etc
Meteor.publish('CurrentRoom', function publishCurrent(roomId) {
	check(roomId, String);
	// return Room.collection.find({ _id: roomId, members: this.userId });
	const roomCursor = Room.collection.find({ _id: roomId, members: this.userId });
	// const chatIds = roomCursor.map(o => o.chatId);
	const gameIds = roomCursor.map(room => room.games).reduce((memo, array) => {
		memo.push(...array.map(obj => obj._id));
		return memo;
	}, []);
	return [
		roomCursor,
		GenericGame.collection.find({ _id: { $in: gameIds } }, {
			// only the bare essential info is published
			fields: {
				name: 1,
				type: 1,
				hostedBy: 1,
				createdAt: 1,
				updatedAt: 1,
				state: 1,
			}
		}),
		// ...Chat.publishChat({ _id: { $in: chatIds } }),
	];
});
