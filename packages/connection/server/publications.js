import { Meteor } from 'meteor/meteor';
import { Connection } from './connection.js';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

Meteor.publish('ClientConnection', (userIds = []) => {
	check(userIds, [String]);
	return [
		Connection.collection.find({
			userId: { $in: userIds },
		}, { fields: { connectionId: 0 } }),
		Accounts.users.find({
			_id: { $in: userIds }
		}, { fields: { username: 1, connections: 1 } }),
	];
});
