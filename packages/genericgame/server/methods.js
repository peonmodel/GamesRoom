import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GenericGame } from './genericgame.js';

Meteor.methods({
	[`${GenericGame.prefix}/updateAlias`]: function({ gameId, alias }) {
		check(gameId, String);
		check(alias, String);
		const game = GenericGame.collection({ _id: gameId });
		const player = game.getPlayer(Meteor.userId());
		return player.updateAlias(alias);
	},
});
