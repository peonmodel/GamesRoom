import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GenericGame } from './genericgame';

// publication for generic list, only public info
Meteor.publish('GameList', function publishList(array) {
	check(array, [String]);
	return GenericGame.collection.find({ _id: { $in: array } }, {
		fields: {
			name: 1,
			type: 1,
			hostedBy: 1,
			createdAt: 1,
			updatedAt: 1,
			state: 1,
		}
	});
});
