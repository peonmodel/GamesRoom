import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';

export const ConnectionCollection = new Mongo.Collection('ConnectionCollection', {
	defineMutationMethods: false
});
// TODO: ensureindex

Meteor.onConnection(({
	id, onClose, httpHeaders
}) => {
  // TODO: remove this
  // console.log(id, close, onClose, clientAddress, httpHeaders);
	console.log('connected id', id);
	ConnectionCollection.insert({
	  connectionId: id,
	  client: httpHeaders['user-agent'],
	  userId: null,
	}, () => {});
	onClose(() => {
	  // NOTE: can keep track on some sort of client usage statistic, but lets not go there... yet
	  // TODO: call some kind of user/player onDisconnect
		console.log('connection closed', id);
	  ConnectionCollection.remove({ connectionId: id }, () => {});
	});
});

Accounts.onLogin(({
  type, allowed, methodName, methodArguments, user, connection
}) => {
	console.log('logged in', connection.id, 'userId', user._id);
	ConnectionCollection.update(connection.id, {
		$set: {userId: user._id},
	}, () => {});
});

// Accounts.onLoginFailure(function() {
// 	console.log('onLoginFailure', arguments);
// });

Accounts.onLogout(({user, connection}) => {
	// when browser closed when logged in, it trigger onClose but not onLogout
	// will trigger login when browser reconnected
	ConnectionCollection.update({ connectionId: connection.id }, {
	  $set: { userId: null },
	}, () => {});
	console.log('onLogout', user, connection);
});
