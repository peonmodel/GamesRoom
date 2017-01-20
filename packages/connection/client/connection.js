import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

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

/**
 * get - helper function to get value in deeply nested objects
 *
 * @param  {object} obj       object to get value from
 * @param  {string|array} params combination of strings and arrays to navigate to value
 * @returns {*}           value to get
 */
function get(obj, ...params) {
	function getObject(object, path) {
		if (_.isUndefined(object)) { return undefined; }
		if (!_.isEmpty(path)) {
			const cur = path.shift(1);
			return getObject(object[cur], path);
		}
		return object;
	}

	let path = _.flatten(params)
							.filter(val => _.isString(val) || _.isNumber(val))
							.map(val => val.toString().split(/\.|\[|\]|,/g));
	path = _.flatten(path).filter(val => !!val);
	return getObject(obj, path);
}

class User {
	/**
	 * Creates an instance of User.
	 *
	 * @param {Object} item - Meteor user object
	 *
	 * @memberOf User
	 */
	constructor(item) {
		Object.assign(this, item);
	}

	/**
	 * status - getter whether user is away/online/busy/etc
	 *
	 * @readonly
	 *
	 * @memberOf User
	 */
	get status() {
		// gets 'away' based on lastActiveAt and current time
		if (!this.isOnline) { return 'offline'; }
		if (new Date() - this.profile.public.lastActiveAt > 30 * 60 * 1000) {
			return 'away';  // if undefined, its false
		}
		// check for busy etc
		return 'online';
	}

	/**
	 * isOnline - getter whether user is online
	 *
	 * @readonly
	 *
	 * @memberOf User
	 */
	get isOnline() {
		return this.profile.public.isOnline;
	}

	/**
	 * displayName - getter display name of player
	 *
	 * @readonly
	 *
	 * @memberOf User
	 */
	get displayName() {
		return get(this, 'profile.public.displayName') || this.username;
	}

	/**
	 * updateDisplayName
	 *
	 * @param {String} name - new display name
	 * @returns {Number} - update result
	 *
	 * @memberOf User
	 */
	async updateDisplayName(name) {
		check(name, String);
		return promiseCall(Meteor.call, `${Connection.prefix}/updateDisplayName`, name);  // eslint-disable-line no-use-before-define
	}
}

Accounts.users._transform = function transformUser(user) {
	return new User(user);
};

export class Connection {
	constructor(item) {
		Object.assign(this, item);
		this._user = Accounts.users.findOne({ _id: this.userId });
		Object.defineProperty(this, '_user', { enumerable: false });
	}

	/**
	 * username - getter to get username
	 *
	 * @readonly
	 *
	 * @memberOf Connection
	 */
	get username() {
		return this._user.username;
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
		if (!!Meteor.user()) { throw new Meteor.Error('already-logged-in'); }
		return promiseCall(Meteor.loginWithPassword, username, password);
	}

	/**
	 * logoutUser - static async function, just a promisified wrapper for logout
	 *
	 * @returns {Promise}  resolve if success
	 */
	static async logoutUser() {
		return promiseCall(Meteor.logout);
	}

	/**
	 * createGuest - creates a guest user
	 *
	 * @static
	 * @param {String} username - username
	 * @returns {String} - id of user
	 *
	 * @memberOf Connection
	 */
	static async createGuest(username) {
		// declaring this function to be async conveniently wraps all returns and throws
		// as a promise resolve/reject
		check(username, String);
		const result = await promiseCall(Meteor.call, `${Connection.prefix}/createGuest`, username);
		await promiseCall(Meteor.loginWithPassword, username, username);
		return result;
	}

	/**
	 * registerGuest - register a guest user
	 *
	 * @static
	 * @param {String} username - new username
	 * @param {String} password - password
	 * @param {String} email - email address
	 * @returns {Number} - update value
	 *
	 * @memberOf Connection
	 */
	static async registerGuest(username, password, email) {
		check(username, String);
		check(password, String);
		check(email, String);
		// if (username.length < 6) {
		// 	throw new Meteor.Error('username-too-short', 'username is too short < 6');
		// }
		// if (password.length < 10) {
		// 	throw new Meteor.Error('password-too-short', 'password is too short < 10');
		// }
		// creating proper account from guest
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('not-logged-in', 'user is not logged in', 'only logged-in guest user can register');
		}
		if (user.profile.public.isRegistered) {
			throw new Meteor.Error('user-already-registered', 'user is not a guest user', 'only guest user needs can register');
		}
		const hashed = Accounts._hashPassword(password);
		await promiseCall(Meteor.call, `${Connection.prefix}/registerGuest`, username, hashed, email);
		await promiseCall(Meteor.loginWithPassword, username, password);
		const result = await promiseCall(Meteor.call, `${Connection.prefix}/checkRegisterGuest`, username, hashed, email);
		return result;
	}

	/**
	 * createUser - create a registered user
	 *
	 * @static
	 * @param {String} username - username
	 * @param {String} password - password
	 * @param {String} email - email address
	 * @returns {String} - id of user
	 *
	 * @memberOf Connection
	 */
	static async createUser(username, password, email) {
		check(username, String);
		check(password, String);
		check(email, String);
		// if (username.length < 6) {
		// 	throw new Meteor.Error('username-too-short', 'username is too short < 6');
		// }
		// if (password.length < 10) {
		// 	throw new Meteor.Error('password-too-short', 'password is too short < 10');
		// }
		const hashed = Accounts._hashPassword(password);
		const result = await promiseCall(Meteor.call, `${Connection.prefix}/createUser`, username, hashed, email);
		await promiseCall(Meteor.loginWithPassword, username, password);
		return result;
	}
}
Connection.prefix = 'freelancecourtyard:connection';
Connection.collection = new Mongo.Collection(`${Connection.prefix}Collection`, {
	transform: function(item) {
		return new Connection(item);
	},
});
