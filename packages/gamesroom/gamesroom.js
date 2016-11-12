import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Chat } from 'meteor/freelancecourtyard:chatmessages';
// import { _ } from 'lodash';

class Room {

	constructor(item) {
		Object.assign(this, item);
	}
	joinRoom(member) {
	  return Room.collection.update(this._id, {
	    $push: {members: member},
	    // $inc: {occupacy: 1},
	  });
	}
	leaveRoom(member) {
	  return Room.collection.update(this._id, {
	    $pull: {members: member},
	    // $inc: {occupacy: 1},
	  });
	}

	clearRoom() {
	  // will be called before deconsting room
	  // TODO: clear members
	  // TODO: clear games
	  // clear room chat
		const chat = Chat.collection.findOne({_id: this.chatId});
	  chat.deconsteChat();
	  return Room.collection.remove({_id: this._id});
	}

	static createRoom() {
	  const title = `Room-${Random.id(4)}`;
	  const members = [];
	  const roomId = Room.collection.insert({
	    title,
	    accessCode: Random.id(6),
	    isPublic: false,
	    capacity: 15,
	    members,
	    games: [],
	    chatId: Chat.createChat('group', `Chat for ${title}`, members),
	  });
	  return roomId;
	}

	static publishRoom(roomQuery, chatQuery, messageQuery) {
	  const roomCursor = Room.collection.find(roomQuery);
	  const chatIds = roomCursor.fetch().map(o => o.chatId);
	  const roomLimited = Object.assign(chatQuery, {_id: {$in: chatIds}});
	  const chatmessageCursors = Chat.publishChat(roomLimited, messageQuery);
	  return [
	    ...chatmessageCursors,
	    roomCursor,
	  ];
	}

}
Room.prefix = `freelancecourtyard:room`;
Room.schema = {
	_id: String,
	title: String,
	accessCode: String,  // for access to private room, also server as shortened id
	isPublic: Boolean,
	capacity: Match.Integer,
	// occupacy: Match.Integer,  // is just members.length
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
Meteor.methods({
	[`${Room.prefix}/`]: function() {},
});

export { Room };
