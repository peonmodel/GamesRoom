import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { CodeNames } from './codenames.js';

// permissions are checked here
Meteor.methods({
	[`${CodeNames.prefix}/createGame`]: function createGame(name, alias) {
		check(name, String);
		check(alias, String);
		const user = Meteor.user();
		alias = alias || user.username;
		return CodeNames.createGame({ name, players: [{ userId: user._id, alias }] }, user);
	},
	[`${CodeNames.prefix}/recreateGame`]: function recreateGame(gameId) {
		check(gameId, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.recreateGame(user);
	},
	[`${CodeNames.prefix}/resetWords`]: function resetWords(gameId) {
		check(gameId, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.resetWords();
	},
	[`${CodeNames.prefix}/changeWord`]: function changeWord(gameId, word) {
		check(gameId, String);
		check(word, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.changeWord(word);
	},
	[`${CodeNames.prefix}/startGame`]: function startGame(gameId) {
		check(gameId, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.startGame();
	},
	[`${CodeNames.prefix}/resetGame`]: function resetGame(gameId) {
		check(gameId, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.resetGame();
	},
	[`${CodeNames.prefix}/endGame`]: function endGame(gameId) {
		check(gameId, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		const player = game.getPlayer(user._id);
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return game.endGame();
	},
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
	[`${CodeNames.prefix}/joinGame`]: function joinGame(gameId, alias, team, role) {
		check(gameId, String);
		check(alias, String);
		check(team, String);
		check(role, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('not-logged-in'); }
		return game.joinGame({ user, alias, team, role });
	},
	[`${CodeNames.prefix}/leaveGame`]: function leaveGame(gameId) {
		check(gameId, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const user = Meteor.user();
		if (!user) { throw new Meteor.Error('not-logged-in'); }
		return game.leaveGame({ user });
	},
	[`${CodeNames.prefix}/updateAlias`]: function updateAlias(gameId, alias) {
		check(gameId, String);
		check(alias, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const player = game.player;
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return player.updateAlias(alias);
	},
	[`${CodeNames.prefix}/updateTeam`]: function updateTeam(gameId, team) {
		check(gameId, String);
		check(team, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const player = game.player;
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return player.updateTeam(team);
	},
	[`${CodeNames.prefix}/updateRole`]: function updateRole(gameId, role) {
		check(gameId, String);
		check(role, String);
		const game = CodeNames.collection.findOne({ _id: gameId });
		const player = game.player;
		if (!player) { throw new Meteor.Error('player-not-found'); }
		return player.updateRole(role);
	},
});
