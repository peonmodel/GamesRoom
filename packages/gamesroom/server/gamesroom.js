import { Mongo } from 'meteor/mongo';
import { Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Chat } from 'meteor/freelancecourtyard:chatmessages';
// import { _ } from 'lodash';

export class Room {

	constructor(item) {
		Object.assign(this, item);
	}

	joinRoom(user) {
	  return Room.collection.update({ _id: this._id }, {
	    $push: { members: user._id },
	  });
	}

	leaveRoom(user) {
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

	static createRoom(user, isPrivate) {
	  const title = `Room-${Random.id(4)}`;
		const members = [user._id];
	  return Room.collection.insert({
	    title,
	    accessCode: Random.id(6),
	    isPublic: !isPrivate,
	    capacity: 15,
	    members: members,
	    games: [],
	    chatId: Chat.createChat('group', `Chat for ${title}`, members),
	  });
	}

	static publishRoom(roomQuery, chatQuery, messageQuery) {
	  const roomCursor = Room.collection.find(roomQuery);
	  const chatIds = roomCursor.map(o => o.chatId);
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
