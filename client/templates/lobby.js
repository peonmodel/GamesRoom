// import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

Template.Lobby.onCreated(() => {
	// Note: if ()=>{} is passed to onRendered, the 'this' is window
	const instance = Template.instance();
	instance.subscribe('PublicRooms');
	instance.subscribe('ActiveRooms');
	// instance.subscribe('Messages', 'public');
	instance.foundRooms = new ReactiveVar([]);
});

Template.Lobby.helpers({
	rooms: function() {
		return Room.collection.find({isPublic: true});
	},
	privateRooms: function() {
		return Room.collection.find({isPublic: { $ne: true }});
	},
	messages: function() {
		// return Message.collection.find({room_id: 'public'});
	},
	foundRooms: function() {
		return Template.instance().foundRooms.get();
	},
});

Template.Lobby.events({
	'click .js-createRoom': async function createRoom() {
		try {
			const roomId = await Room.createRoom(false);
			sAlert.success(`Room created, redirecting to room: ${roomId}`);
			FlowRouter.go('room', {roomId: roomId});
		} catch (error) {
			sAlert.error(error);
		}
	},
	'click .js-createPrivateRoom': async function createPrivateRoom() {
		try {
			const roomId = await Room.createRoom();
			sAlert.success(`Room created, redirecting to room: ${roomId}`);
			FlowRouter.go('room', { roomId: roomId });
		} catch (error) {
			sAlert.error(error);
		}
	},
	'click .js-findRooms': async function join(event, instance) {
		const accesscode = instance.find('.accesscode').value;
		const rooms = await Room.findRoomsByCode(accesscode);
		instance.foundRooms.set(rooms);
	},
});
