import { Meteor } from 'meteor/meteor';
import { Room } from './gamesroom.js';

Meteor.publish('PublicRooms', () => {
	return Room.collection.find({ isPublic: true });
});
