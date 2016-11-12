import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';

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
				lastActiveAt: new Date(),
			},
		});
	}

	static registerGuest(user, username, hashed) {
		// creating proper account from guest
		Accounts.setUsername(user._id, username);
		Accounts.setPassword(user._id, hashed);
	}

	static createUser() {

	}
}
Connection.prefix = 'freelancecourtyard:connection';
Connection.collection = new Mongo.Collection('Connections', {
	transform: function(item) {
		return new Connection(item);
	},
	defineMutationMethods: false,  // TODO: ensureindex
});

Accounts.config({
	forbidClientAccountCreation: true,
});

// TODO: ensureIndex on users Accounts to remove temp acc

Meteor.onConnection(({
	id, onClose, httpHeaders
}) => {
  // TODO: remove this
  // console.log(id, close, onClose, clientAddress, httpHeaders);
	console.log('connected id', id);
	Connection.collection.insert({
	  connectionId: id,
	  client: httpHeaders['user-agent'],
	  userId: null,
	}, () => {});
	onClose(() => {
	  // NOTE: can keep track on some sort of client usage statistic, but lets not go there... yet
	  // TODO: call some kind of user/player onDisconnect
		console.log('connection closed', id);
	  Connection.collection.remove({ connectionId: id }, () => {});
	});
});

Accounts.onLogin(({
  type, allowed, methodName, methodArguments, user, connection
}) => {
	console.log('logged in', connection.id, 'userId', user._id);
	Connection.collection.update(connection.id, {
		$set: {userId: user._id},
	}, () => {});
});

// Accounts.onLoginFailure(function() {
// 	console.log('onLoginFailure', arguments);
// });

Accounts.onLogout(({user, connection}) => {
	// when browser closed when logged in, it trigger onClose but not onLogout
	// will trigger login when browser reconnected
	Connection.collection.update({ connectionId: connection.id }, {
	  $set: { userId: null },
	}, () => {});
	console.log('onLogout', user, connection);
});
