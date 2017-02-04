import { Meteor } from 'meteor/meteor';
import { CodeNames } from './codenames.js';
import { check } from 'meteor/check';

Meteor.publish('CodeNames', function publishGame(id) {
	check(id, String);
	const options = { fields: { hiddenTeams: false } };
	const game = CodeNames.collection.findOne({ _id: id });
	if (!game) { return this.ready(); }
	if (game._isClueGiver({ _id: this.userId }) && game.isGameInProgress) {
		delete options.fields;
	}
	return CodeNames.collection.find({ _id: id }, options);
});

Meteor.publish('CodeNamesClueGiver', function publishGame(id) {
	console.log('resub?')
	check(id, String);
	const game = CodeNames.collection.findOne({ _id: id });
	if (!game) { return this.ready(); }
	if (!game._isClueGiver({ _id: this.userId }) || !game.isGameInProgress) {
		return this.ready();
	}
	console.log('CodeNamesClueGiver')
	return CodeNames.collection.find({ _id: id }, { hiddenTeams: true });
});
