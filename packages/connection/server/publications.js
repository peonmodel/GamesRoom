import { Meteor } from 'meteor/meteor';
import { ConnectionCollection } from './publications.js';

Meteor.publish('ClientConnection', function(userIds){
	return ConnectionCollection.find({
		userId: { $in: userIds },
	}, { fields: { connectionId: 0 } });
});
