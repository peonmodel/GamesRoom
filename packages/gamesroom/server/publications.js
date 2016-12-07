import { Meteor } from 'meteor/meteor';
import { Room } from './gamesroom.js';
import { check } from 'meteor/check';
// import { Chat } from 'meteor/freelancecourtyard:chatmessages';

Meteor.publish('PublicRooms', function publishPublic() {
	return Room.collection.find({ isPublic: true }, {
		fields: { members: 0, accessCode: 0 },
	});
});

Meteor.publish('ActiveRooms', function publishActive() {
	return Room.collection.find({ members: this.userId }, {
		fields: { members: 0, accessCode: 0 },
	});
});

Meteor.publish('CurrentRoom', function publishCurrent(roomId) {
	check(roomId, String);
	return Room.collection.find({ _id: roomId, members: this.userId });
	// const roomCursor = Room.collection.find({ _id: roomId, members: this.userId });
	// const chatIds = roomCursor.map(o => o.chatId);
	// return [
	// 	roomCursor,
	// 	...Chat.publishChat({ _id: { $in: chatIds } }),
	// ];
});
