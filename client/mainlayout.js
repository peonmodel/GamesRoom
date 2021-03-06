import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { Connection } from 'meteor/freelancecourtyard:connection';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import './main.html';

function createRandomName() {
	const colorArray = [
		'Pink', 'Blue', 'Orange', 'Green', 'Yellow', 'Fuchsia', 'Red', 'Golden', 'Silver', 'Brown'
	];
	const sizeArray = [
		'Little', 'Small', 'Big', 'Fat', 'Tiny', 'Huge', 'Mini'
	];
	const emotionArray = [
		'Happy', 'Sad', 'Depressed', 'Excited', 'Angry', 'Motivated', 'Scared', 'Energized', 'Surprised', 'Tired'
	];
	const nounArray = [
		'Diamond', 'JetPack', 'Cruiser', 'Bunny', 'Lambini', 'Bird', 'Elephant', 'Frog', 'Player', 'Lover', 'Guest',
		'User', 'Cow', 'Mustang', 'Student', 'Driver', 'Hawker', 'Villager', 'Explorer', 'Dancer', 'Stranger', 'Farmer', 'Boat', 'Car', 'Chicken', 'Machine', 'Thing'
	];
	const number = _.sample(_.range(10, 2110));
	const tempName = _.sample(emotionArray) + _.sample(sizeArray) + _.sample(colorArray) + _.sample(nounArray) + number;
	return tempName;
}

Template.MainLayout.events({
	'click .js-logout': async function logout() {
		try {
			await Connection.logoutUser();
			console.log(`logged out`);
			sAlert.success(`logged out`);
		} catch (error) {
			console.error(`error logging out`);
			sAlert.error(`error logging out`);
		}
	},
});

Template.GuestLogIn.events({
	'click .js-guestlogin': async function(event, instance) {
		const username = instance.data.tempName;
		try {
			await Connection.createGuest(username);
		} catch (error) {
			console.error(`error logging in`, error);
			sAlert.error(`error logging in: ${error.reason || error}`);
		}
		// const userId = await Connection.createGuest(username);
	},
});

Template.RegisterOrLogin.onCreated(function() {
	const instance = this;
	instance.data.tempName = createRandomName();
	// instance.toggle = new ReactiveVar(true);  // show = true
});

Template.RegisterOrLogin.helpers({
	// showTextBox() {
	// 	const instance = Template.instance();
	// 	return !Meteor.user() || instance.toggle.get();
	// },
});

Template.RegisterOrLogin.events({
	'click .js-login': async function login() {
		const instance = Template.instance();
		try {
			// create account
			const username = instance.find('input.username').value;
			const password = instance.find('input.password').value;
			await Connection.loginUser(username, password);
		} catch (error) {
			console.error(error);
			sAlert.error(error);
		}
	},
	'click .js-register': async function register() {
		try {
			const instance = Template.instance();
			// create account
			const username = instance.find('input.username').value;
			const password = instance.find('input.password').value;
			const user = Meteor.user();
			if (!user) {
				// when not logged in and try to register, create new account
				return await Connection.createUser(username, password);
			}
			// when logged in as guest, registerGuest instead
			// change username & password, keep account otherwise
			return await Connection.registerGuest(username, password);
		} catch (error) {
			console.error(error);
			sAlert.error(error);
		}
	},
});
