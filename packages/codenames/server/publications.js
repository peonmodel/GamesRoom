import { Meteor } from 'meteor/meteor';
import { CodeNames } from './codenames.js';
import { check } from 'meteor/check';

Meteor.publish('CodeNames', function publishGame(id) {
	check(id, String);
	const options = { fields: { hiddenTeams: false } };
	const game = CodeNames.collection.findOne({ _id: id });
	if (!game) { return this.ready(); }
	// if (game._isClueGiver({ _id: this.userId }) && game.isGameInProgress) {
	// 	delete options.fields;
	// }
	return CodeNames.collection.find({ _id: id }, options);
});

Meteor.publish('CodeNamesClueGiver', function publishGame(id, role) {
	check(id, String);
	check(role, String);
	const game = CodeNames.collection.findOne({ _id: id });
	if (!game) { return this.stop(); }
	this.added(`${CodeNames.collectionName}Collection`, id, { hiddenTeams: undefined });
	this.ready();
	if (!game._isClueGiver({ _id: this.userId }) || !game.isGameInProgress) {
		this.changed(`${CodeNames.collectionName}Collection`, id, { hiddenTeams: undefined });
	} else {
		this.changed(`${CodeNames.collectionName}Collection`, id, { hiddenTeams: game.hiddenTeams });
	}
	// return CodeNames.collection.find({ _id: id }, { hiddenTeams: true });
});
