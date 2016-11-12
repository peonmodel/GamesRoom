import { Meteor } from 'meteor/meteor';
import { ConnectionCollection } from './publications.js';
import { check } from 'meteor/check';

Meteor.publish('ClientConnection', (userIds) => {
	check(userIds, String);
	return ConnectionCollection.find({
		userId: { $in: userIds },
	}, { fields: { connectionId: 0 } });
});
