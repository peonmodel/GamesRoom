import { Meteor } from 'meteor/meteor';
import { Connection } from './publications.js';
import { check } from 'meteor/check';

Meteor.publish('ClientConnection', (userIds) => {
	check(userIds, String);
	return Connection.collection.find({
		userId: { $in: userIds },
	}, { fields: { connectionId: 0 } });
});
