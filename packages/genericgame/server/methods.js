import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GenericGame } from './genericgame.js';

Meteor.methods({
	[`${GenericGame.prefix}/createGame`]: function createGame(name, alias) {
		check(name, String);
		check(alias, String);
		const user = Meteor.user();
		alias = alias || user.username;
		return GenericGame.createGame({ name, players: [{ userId: user._id, alias }] }, user);
	},
	[`${GenericGame.prefix}/recreateGame`]: function recreateGame(gameId) {
		check(gameId, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.recreateGame(user);
	},
	[`${GenericGame.prefix}/startGame`]: function startGame(gameId) {
		check(gameId, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.startGame();
	},
	[`${GenericGame.prefix}/resetGame`]: function resetGame(gameId) {
		check(gameId, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.resetGame();
	},
	[`${GenericGame.prefix}/endGame`]: function endGame(gameId) {
		check(gameId, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.endGame();
	},
	[`${GenericGame.prefix}/joinGame`]: function joinGame(gameId, alias, team, role) {
		check(gameId, String);
		check(alias, String);
		check(team, String);
		check(role, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('not-logged-in'); }
		return game.joinGame({ user, alias, team, role });
	},
	[`${GenericGame.prefix}/leaveGame`]: function leaveGame(gameId) {
		check(gameId, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('not-logged-in'); }
		return game.leaveGame({ user });
	},
	[`${GenericGame.prefix}/endTurn`]: function endTurn(gameId) {
		check(gameId, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		return game.endTurn();
	},

	// GenericPlayer
	[`${GenericGame.prefix}/updateAlias`]: function updateAlias(gameId, alias) {
		check(gameId, String);
		check(alias, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const player = game.player;
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return player.updateAlias(alias);
	},
	[`${GenericGame.prefix}/updateTeam`]: function updateTeam(gameId, team) {
		check(gameId, String);
		check(team, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const player = game.player;
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return player.updateTeam(team);
	},
	[`${GenericGame.prefix}/updateRole`]: function updateRole(gameId, role) {
		check(gameId, String);
		check(role, String);
		const game = GenericGame.collection.findOne({ _id: gameId });
		const player = game.player;
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return player.updateRole(role);
	},
});
