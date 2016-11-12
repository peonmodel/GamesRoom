import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.Lobby.onRendered(() => {
	// let instance = this;
	// instance.subscribe('Rooms');
	// instance.subscribe('Messages', 'public');
});

Template.Lobby.helpers({
	rooms: function() {
		// return Room.collection.find({is_public: true});
	},
	privateRooms: function() {
		// return Room.collection.find({is_public: false});
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
	'click .js-createRoom': function(event) {
		if (!!Meteor.user()) {
			Meteor.call('rooms/add', true, 7, (err, res) => {
				if (err) {
					console.error(err);
				} else {
					sAlert.success(`Room created, redirecting to room: ${res}`);
					// redirect to newly created room
					Meteor.call('rooms/join', res, (error, result) => {
						if (error) {
							console.log(error);
						} else {
							FlowRouter.go('room', {accesscode: res});
						}
					});
				}
			});
		} else {
			sAlert.error(`log in required to join room, try login as guest or register an account`);
		}
	},
	'click .js-createPrivateRoom' (event) {
		if (!!Meteor.user()) {
			Meteor.call('rooms/add', false, 7, (err, roomId) => {
				if (err) {
					console.error(err);
				} else {
					sAlert.success(`Room created, redirecting to room: ${roomId}`);
					// redirect to newly created room
					Meteor.call('rooms/join', roomId, (error, result) => {
						if (error) {
							console.log(error);
						} else {
							FlowRouter.go('room', {accesscode: roomId});
						}
					});
				}
			});
		} else {
			sAlert.error(`log in required to join room, try login as guest or register an account`);
		}
	},
	// TODO: to be removed, for testing only
	'click .js-clearAll' (event) {
		event.preventDefault();
		Meteor.call('rooms/removeAll', {}, (err, res) => {
			if (err) {
				console.log(err);
			} else {
				sAlert.success('Rooms cleared');
			}
		});
		/*Rooms.find().fetch().map(({_id}) => {
			Rooms.remove(_id);
		});*/
	},
	'click .js-join' (event) {
		if (!Meteor.user()) {
			sAlert.error(`log in required to join room, try login as guest or register an account`);
			return;
		}
		let instance = Template.instance();
		let accesscode = $(instance.find('.accesscode')).val();
		let target = Room.collection.findOne({_id: accesscode});
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
//	'change input.username' (event) {
//		let user = $(event.target).val();
//		Session.set('session', user);  // problem, what if duplicate?
//
//	},
});
