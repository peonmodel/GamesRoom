import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

/**
 * promiseCall - function to wrap async Meteor functions into returning promises
 *
 * @param  {Function} fn - async function to wrap
 * @param  {Array} params - array of params
 * @returns {Promise}           resolve if success
 */
function promiseCall(fn, ...params) {
	return new Promise((resolve, reject) => {
		fn(...params, (err, res) => {
			if (err) { return reject(err); }
			return resolve(res);
		});
	});
}

export class Connection {
	constructor(item) {
		Object.assign(this, item);
	}

	/**
	 * loginUser - static async	function, just a wrapper to make loginWithPassword
	 * into returning a Promise instead of callback to be consistent
	 *
	 * @param  {String} username - username
	 * @param  {String} password - password
	 * @returns {Promise} - resolve if success
	 */
	static async loginUser(username, password) {
		check(username, String);
		check(password, String);
		return promiseCall(Meteor.loginWithPassword, username, password);
	}

	static async createGuest(username) {
		// declaring this function to be async conveniently wraps all returns and throws
		// as a promise resolve/reject
		check(username, String);
		var result = await promiseCall(Meteor.call, `${Connection.prefix}/createGuest`, username);  // eslint-disable-line no-var
		await promiseCall(Meteor.loginWithPassword, username, username);
		return result;
	}

	static async registerGuest(username, password) {
		check(username, String);
		check(password, String);
		if (username.length < 6) {
			throw new Meteor.Error('username-too-short', 'username is too short < 6');
		}
		if (password.length < 10) {
			throw new Meteor.Error('password-too-short', 'password is too short < 10');
		}
		// creating proper account from guest
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('not-logged-in', 'user is not logged in', 'only logged-in guest user can register');
		}
		if (user.profile.isRegistered) {
			throw new Meteor.Error('not-guest', 'user is not a guest user', 'only guest user needs can register');
		}
		const hashed = Accounts._hashPassword(password);
		var result = await promiseCall(Meteor.call, `${Connection.prefix}/registerGuest`, username, hashed);  // eslint-disable-line no-var
		await promiseCall(Meteor.loginWithPassword, username, password);
		return result;
	}

	static async createUser(username, password) {
		check(username, String);
		check(password, String);
	}
}
Connection.collection = new Mongo.Collection('Connections', {
	transform: function(item) {
		return new Connection(item);
	},
});
Connection.prefix = 'freelancecourtyard:connection';
