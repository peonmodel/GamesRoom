import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';
import { _ } from 'meteor/underscore';
import './main.html';

function createGuest(username) {
	Accounts.createUser({
		username: username,
		// email: '',
		// set guest password to username so easy to retrieve and remember
		password: username,
		profile: {
			is_registered: false,  // is guest user
			date_created: new Date(),
			last_active: new Date(),
		},
	}, (err) => {
		if (err) {
			console.error(err);
			// sAlert.error(`unable to create temporary account`);
		}
	});
}

function createRandomName() {
	function pickFromArray(items) {
		return items[Math.floor(Math.random() * items.length)];
	}
	const colorArray = [
		'Pink',
		'Blue',
		'Orange',
		'Green',
		'Yellow',
		'Fuchsia',
		'Red',
		'Golden',
		'Silver',
		'Brown'
	];
	const sizeArray = [
		'Little',
		'Small',
		'Big',
		'Fat',
		'Tiny',
		'Huge',
		'Mini',
	];
	const emotionArray = [
		'Happy',
		'Sad',
		'Depressed',
		'Excited',
		'Angry',
		'Motivated',
		'Scared',
		'Energized',
		'Surprised',
		'Tired',
	];
	const nounArray = [
		'Diamond',
		'JetPack',
		'Cruiser',
		'Bunny',
		'Lambini',
		'Bird',
		'Elephant',
		'Frog',
		'Player',
		'Lover',
		'Guest',
		'User',
		'Cow',
		'Mustang',
		'Student',
		'Driver',
		'Hawker',
		'Villager',
		'Explorer',
		'Dancer',
		'Stranger',
		'Farmer',
		'Boat',
		'Car',
		'Chicken',
		'Machine',
		'Thing',
	];
	const number = _.sample(_.range(10, 2110));
	const tempName = pickFromArray(emotionArray) + pickFromArray(sizeArray) + pickFromArray(colorArray) + pickFromArray(nounArray) + number;
	return tempName;
}

// Template.MainLayout.onCreated(function() {
// 	if (!!Meteor.user() && !!Meteor.loggingIn()) {
// 		// creates guest account upon reload if not already logged in
// //		createGuest();
// 	}
// });

Template.MainLayout.events({
	'click .js-logout'() {
		// TODO: if guest, destroy guest
//		let user_id = Meteor.userId();
		Meteor.logout((err) => {
			if (err) {
				console.error(`error logging out`);
				// sAlert.error(`error logging out`);
			} else {
				console.log(`logged out`);
				// sAlert.success(`logged out`);
			}
		});
	},
});

Template.GuestLogIn.events({
	'click .js-guestlogin'(event, instance) {
		const username = instance.data.tempName;
		createGuest(username);
	},
});

Template.RegisterOrLogin.onCreated(function() {
	const instance = this;
	instance.toggled = new ReactiveVar(!Meteor.user());  // maybe no need

	instance.data.tempName = createRandomName();
	console.log('RegisterOrLogin created')
});

Template.RegisterOrLogin.events({
	'click .js-login': function() {
		const instance = Template.instance();
		const toggled = instance.toggled.get();
		console.log('toggled', toggled)

		if (toggled) {
			// create account
			const username = $(instance.find('input.username')).val();
			// if username is '', error
			const password = $(instance.find('input.password')).val();
			// if password is '', error or too short
			// if already logged in as guest, change username & password instead

			Meteor.loginWithPassword({username: username}, password, (err) => {
				if (err) {
					console.error(err.reason);
					// sAlert.error(`error logging in: ${err.reason}`);
				}
			});
		} else {
			instance.toggled.set(!toggled);
		}
	},
	'click .js-register': function() {
		const instance = Template.instance();
		const toggled = instance.toggled.get();
		console.log('toggled', toggled)
		if (toggled) {
			// create account
			const username = $(instance.find('input.username')).val();
			// if username is '', error
			const password = $(instance.find('input.password')).val();
			// if password is '', error or too short
			// if already logged in as guest, change username & password instead

			const user = Meteor.user();
			let guestId = null;
			if (!!user && user.profile.is_registered === false) {
				guestId = user._id;
			}
				// not logged in at all
			Accounts.createUser({
				username: username,
//				email: email,
				password: password,
				profile: {
					is_registered: true,
					date_created: new Date(),
					last_active: new Date(),
					guestId: guestId,
				},
			}, (err) => {
				if (err) {
					console.error(err);
					// sAlert.error(`unable to create account: ${err.reason}`);
				} else {
					console.log(`account registered`);
					// sAlert.success(`account registered`);
				}
			});
		} else {
			instance.toggled.set(!toggled);
		}
	},
});

Template.RegisterOrLogin.helpers({
	toggled: function() {
		const instance = Template.instance();
		return instance.toggled.get();
	},
});
