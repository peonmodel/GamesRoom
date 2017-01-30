import { Meteor } from 'meteor/meteor';
import { CodeNames } from './codenames.js';
import { check } from 'meteor/check';

Meteor.publish('CodeNames', function publishGame(id) {
	check(id, String);
	const options = { fields: { 'words.hiddenTeam': 0 } };
	const game = CodeNames.collection.findOne({ _id: id });
	if (!game) { return this.ready(); }
	if (game._isClueGiver({ _id: this.userId })) {
		delete options.fields;
	}
	return CodeNames.collection.find({ _id: id }, options);
});
