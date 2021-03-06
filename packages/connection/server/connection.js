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

export class Connection {
	constructor(item) {
		Object.assign(this, item);
	}

	static createGuest(username) {
		return Accounts.createUser({
			username: username,
			password: username,  // TODO: change to no password + loginWithToken
			profile: {
				isRegistered: false,  // is guest user
			},
		});
	}

	static registerGuest(user, username, hashed) {
		// creating proper account from guest
		Accounts.setUsername(user._id, username);  // may fail due to conflict with other usernames
		Accounts.setPassword(user._id, hashed);
		return Accounts.users.update({ _id: user }, {
			$set: { 'profile.isRegistered': true }
		}, () => {});
	}

	static createUser(username, hashed) {
		return Accounts.createUser({
			username: username,
			password: hashed,
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
			const modifier = { $pull: { 'profile.connections': this._id } };
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

Accounts.config({
	forbidClientAccountCreation: true,
});

// TODO: ensureIndex on users Accounts to remove temp acc

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
	if (!user.profile.isRegistered) {
		// delete guest users, event only trigger if user explictly logout
		Accounts.users.remove({ _id: user._id }, () => {});
	}
	Connection.collection.update({ connectionId: connection.id }, {
	  $set: { userId: null },
	}, () => {});
});
