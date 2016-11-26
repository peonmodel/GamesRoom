// import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Room } from 'meteor/freelancecourtyard:gamesroom';
import { Chat } from 'meteor/freelancecourtyard:chatmessages';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { FlowRouter } from 'meteor/kadira:flow-router';
// import { ReactiveVar } from 'meteor/reactive-var';

Template.RoomWrapper.onCreated(() => {
	const instance = Template.instance();
	instance.roomId = FlowRouter.getParam('roomId');
	console.log('RoomWrapper onCreated')
	instance.subscribe('CurrentRoom', instance.roomId, {
		onStop() {},
		onReady() {
			if (!Room.collection.findOne({ _id: instance.roomId })) {
				FlowRouter.go('public');
				console.warn('room not found, redirecting to public lobby');
				sAlert.warning('room not found, redirecting to public lobby');
			}
		},
	});
});

Template.RoomWrapper.helpers({
	getRoom() {
		const instance = Template.instance(); 
		return Room.collection.findOne({ _id: instance.roomId });
	},
});

Template.Room.onCreated(() => {
	const instance = Template.instance();
	console.log(instance)
	instance.subscribe('RoomChat', instance.data.room.chatId);
});

Template.Room.helpers({
	getChat() {
		const instance = Template.instance();
		console.log('getChat', instance)
		return Chat.collection.findOne({ _id: instance.data.room.chatId });
	},
});

Template.Chat.events({
	'click .js-sendMessage': async function(event, instance) {
		const message = instance.find('.message').value;
		const chat = instance.data.chat;
		try {
			await chat.createMessage(message);
		} catch (error) {
			console.error(error);
			sAlert.error(error);
		}
	},
});
