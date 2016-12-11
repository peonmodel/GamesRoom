// import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { FlowRouter } from 'meteor/kadira:flow-router';
// import { ReactiveVar } from 'meteor/reactive-var';

Template.RoomListItem.onCreated(() => {});

Template.RoomListItem.helpers({});

Template.RoomListItem.events({
	'click .js-joinRoom': async function joinRoom(event, instance) {
		try {
			const roomId = instance.data.room._id;
			await instance.data.room.joinRoom();
			sAlert.success(`Room created, redirecting to room: ${roomId}`);
			FlowRouter.go('room', {roomId: roomId});
		} catch (error) {
			sAlert.error(error);
			console.error(error);
		}
	},
	'click .js-joinRoomWithCode': async function joinRoomWithCode(event, instance) {
		try {
			const accesscode = instance.find('.accesscode').value;
			const roomId = instance.data.room._id;
			await instance.data.room.joinRoom(accesscode);
			FlowRouter.go('room', {roomId: roomId});
		} catch (error) {
			sAlert.error(error);
			console.error(error);
		}
	},
});
