import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.Lobby.onRendered(() => {
	// const instance = this;
	// instance.subscribe('Rooms');
	// instance.subscribe('Messages', 'public');
});

Template.Lobby.helpers({
	rooms: function() {
		return Room.collection.find({isPublic: true});
	},
	privateRooms: function() {
		return Room.collection.find({isPublic: false});
	},
	messages: function() {
		// return Message.collection.find({room_id: 'public'});
	},
//	defaultusertext() {
//		console.log('user', Meteor.user())
//		uu = Meteor.user()
//		if (!!Meteor.user()) {
//			return Meteor.user().username;
//		} else {
//			return '';
//		}
//	},
//	readonly() {
//		if (!!Meteor.user()) {
//			return 'readonly';
//		} else {
//			return '';
//		}
//	},
});

Template.Lobby.events({
	'click .js-createRoom': async function createRoom() {
		try {
			const roomId = await Room.createRoom(false);
			sAlert.success(`Room created, redirecting to room: ${roomId}`);
			FlowRouter.go('room', {accesscode: roomId});
		} catch (error) {
			sAlert.error(error);
		}
	},
	'click .js-createPrivateRoom': async function createPrivateRoom() {
		try {
			const roomId = await Room.createRoom();
			sAlert.success(`Room created, redirecting to room: ${roomId}`);
			FlowRouter.go('room', {accesscode: roomId});
		} catch (error) {
			sAlert.error(error);
		}
	},
	// TODO: to be removed, for testing only
	'click .js-clearAll': async function clear() {
		console.log('not used');
	},
	'click .js-join': async function join(event, instance) {
		console.log('instance', instance, Template.instance())
		// try {
		// 	// instance.data.room.join();
		// } catch (error) {
		// 	sAlert.error(error);
		// 	console.error(error);
		// }

		// const instance = Template.instance();
		const accesscode = $(instance.find('.accesscode')).val();
		const target = Room.collection.findOne({_id: accesscode});
		if (!target) {
			sAlert.error('Room not found');
			return;
		}
		// TODO: check if the room is full
		if (target.capacity > target.users.length) {
			// javascript onbeforeunload to decrement, + refresh
//			console.log('updating join')
//			Rooms.update(target._id, {$inc: {occupancy: 1}});
			Meteor.call('rooms/join', accesscode, function (error, result) {
				if (error) {
					console.log(error);
				} else {
					FlowRouter.go('room', {accesscode: accesscode});
				}
			});
		} else {
			sAlert.error('Room is full');
		}
	},
});
