import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { CodeNames } from './codenames.js';

// permissions are checked here
Meteor.methods({
	[`${CodeNames.prefix}/revealWord`]: function revealWord(gameId, word) {
		check(gameId, String);
		check(word, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		if (!game.isActivePlayer) { throw new Meteor.Error('not-active-player'); }
		if (game.isClueGiver) { console.log('boo3'); throw new Meteor.Error('clue-giver-cannot-reveal'); }
		return game.revealWord(word, user);
	},
	[`${CodeNames.prefix}/giveClue`]: function giveClue(gameId, word, number) {
		check(gameId, String);
		check(word, String);
		check(number, Number);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		if (!game.isActivePlayer) { throw new Meteor.Error('not-active-player'); }
		if (!game.isClueGiver) { throw new Meteor.Error('non-clue-giver-cannot-give-clue'); }
		return game.giveClue(word, number, user);
	},
});
