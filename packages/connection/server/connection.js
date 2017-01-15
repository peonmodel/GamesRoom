import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';

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
	 * updateActive - updates user last active time
	 *
	 * @returns {undefined} - async update has no return value
	 *
	 * @memberOf User
	 */
	updateActive() {
		return Accounts.users.update({ _id: this._id }, {
			$currentDate: { 'profile.public.lastActiveAt': true },
		}, () => {});
	}
}

Accounts.users._transform = function transformUser(user) {
	return new User(user);
};
Accounts.config({
	forbidClientAccountCreation: true,
});
// TODO: ensureIndex on users Accounts to remove temp acc

export class Connection {
	constructor(item) {
		Object.assign(this, item);
	}

	static createGuest(username) {
		return Accounts.createUser({
			username: username,
			password: username,  // TODO: change to no password + loginWithToken
			profile: {
				public: { isRegistered: false },  // is guest user
			},
		});
	}

	static registerGuest(user, username, hashed, email) {
		// creating proper account from guest
		Accounts.setUsername(user._id, username);  // may fail due to conflict with other usernames
		Accounts.setPassword(user._id, hashed);
		Accounts.addEmail(user._id, email);
		return Accounts.users.update({ _id: user._id }, {
			$set: { 'profile.public.isRegistered': true }
		});
	}

	/**
	 * checkRegisterGuest - check that registerGuest is ran correctly
	 * due to some behaviour with update meteor user causes connection to break
	 * and meteor default behaviour of re-sending method request when connection break
	 *
	 * @static
	 * @param {User} user - user
	 * @param {String} username - username
	 * @param {Object} hashed - password hash object
	 * @param {String} email - email address
	 * @returns {Number} - 1 if all is okay
	 * 
	 * @memberOf Connection
	 */
	static checkRegisterGuest(user, username, hashed, email) {
		if (user.username !== username) {
			throw new Meteor.Error('username not changed');
		}
		if (Accounts._checkPassword(user, hashed).error) {
			throw new Meteor.Error('password not changed');
		}
		if (!(user.emails || []).find(o => o.address === email)) {
			throw new Meteor.Error('email not changed');
		}
		return 1;
	}

	static createUser(username, hashed, email) {
		return Accounts.createUser({
			username: username,
			password: hashed,
			email: email,
			profile: {  // stuff user can see itself
				connections: [],
				public: {  // stuff others can see user, can be further filtered
					lastActiveAt: null,  // other may want to see is user is active
					isRegistered: true,  // similarly, see if user is a anonymous temp user
					isOnline: false,
				},
			},
		});
	}

	disconnect() {
		if (this.userId) {
			const user = Accounts.users.findOne({ _id: this.userId });
			const modifier = { $pull: { 'profile.connections': this.connectionId } };
			if (user.profile.connections.length >= 1) {
				modifier.$set = { 'profile.public.isOnline': true };
			}
			Accounts.users.update({ _id: this.userId }, modifier, () => {});
		}
		return Connection.collection.remove({ connectionId: this._id }, () => {});
	}
}
Connection.prefix = 'freelancecourtyard:connection';
Connection.collection = new Mongo.Collection(`${Connection.prefix}Collection`, {
	transform: function(item) {
		return new Connection(item);
	},
	defineMutationMethods: false,  // TODO: ensureindex on userId
});

Meteor.onConnection(({
	id, onClose, httpHeaders
}) => {
  // console.log(id, close, onClose, clientAddress, httpHeaders);
	Connection.collection.insert({
	  connectionId: id,
	  client: httpHeaders['user-agent'],
	  userId: null,
	}, () => {});
	onClose(() => {
	  // NOTE: can keep track on some sort of client usage statistic, but lets not go there... yet
		const connection = Connection.collection.findOne({ connectionId: id });
		return connection.disconnect();
	});
});

Accounts.onLogin(({
  type, allowed, methodName, methodArguments, user, connection
}) => {
	// console.log('logged in', connection.id, 'userId', user._id);
	Accounts.users.update({ _id: user._id }, {
		$set: {
			'profile.public.lastActiveAt': new Date(),
			'profile.public.isOnline': true,
		},
		$push: {
			'profile.connections': connection.id,
		},
	}, () => {});
	Connection.collection.update({ connectionId: connection.id }, {
		$set: { userId: user._id },
	}, () => {});
});

// Accounts.onLoginFailure(function() {
// 	console.log('onLoginFailure', arguments);
// });

Accounts.onLogout(({user, connection}) => {
	// when browser closed when logged in, it trigger onClose but not onLogout
	// will trigger login when browser reconnected
	if (!user) { return; }
	if (!user.profile.public.isRegistered) {
		// delete guest users, event only trigger if user explictly logout
		Accounts.users.remove({ _id: user._id }, () => {});
	} else {
		Accounts.users.update({ _id: user._id }, { $pull: { 'profile.connections': connection.id } }, () => {});
	}
	Connection.collection.update({ connectionId: connection.id }, {
	  $set: { userId: null },
	}, () => {});
});
