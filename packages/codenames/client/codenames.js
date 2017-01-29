import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { GenericGame } from 'meteor/freelancecourtyard:genericgame';
import { _ } from 'meteor/underscore';

/**
 * promiseCall - function to wrap async Meteor functions into returning promises
 *
 * @param  {Function} fn - async function to wrap
 * @param  {Array} params - array of params
 * @returns {Promise}           resolve if success
 */
function promiseCall(fn, ...params) {
	return new Promise((resolve, reject) => {
		fn(...params, (err, res) => {
			if (err) { return reject(err); }
			return resolve(res);
		});
	});
}

export class CodeNames extends GenericGame {
	constructor(item) {
		super(item);
		Object.assign(this, item);
		this._collection = CodeNames.collection;
		Object.defineProperty(this, '_collection', { enumerable: false });
	}

	get currentClue() {
		return _.last(this.state.clues) || {};
	}

	get clueLimit() {
		const last = _.last(this.state.clues);
		if (!last || !last.count) { return Infinity; }
		return last.count + 1;
	}

	get isGameInProgress() {
		return !(this.state.activeTeam === 'setup' || this.state.activeTeam === 'ended');
	}

	get team() {
		return this.player.team;
	}

	get isActivePlayer() {
		if (!this.isGameInProgress) { return false; }
		if (this.team !== this.state.activeTeam) { return false; }
		if (this.state.isClueGiven) { return !this.isClueGiver; }
		return this.isClueGiver;
	}

	get isClueGiver() {
		return this.player.role === 'cluegiver';
	}

	static async createGame(name, alias = '') {
		check(name, String);
		check(alias, String);
		return promiseCall(Meteor.call, `${CodeNames.prefix}/createGame`, name, alias);
	}

	async resetWords() {
		if (!this.player) {
			throw new Meteor.Error('player-not-found');
		}
		if (this.state.activeTeam !== 'setup') {
			throw new Meteor.Error('cannot-change-after-game-start');
		}
		return promiseCall(Meteor.call, `${CodeNames.prefix}/resetWords`, this._id);
	}

	async changeWord(word) {
		check(word, String);
		if (!this.player) {
			throw new Meteor.Error('player-not-found');
		}
		if (this.state.activeTeam !== 'setup') {
			throw new Meteor.Error('cannot-change-after-game-start');
		}
		if (!this.words.find(o => o.word === word)) {
			throw new Meteor.Error('word-not-found');
		}
		return promiseCall(Meteor.call, `${CodeNames.prefix}/changeWord`, this._id, word);
	}

	async revealWord(word) {
		check(word, String);
		if (!this.isActivePlayer) {
			throw new Meteor.Error('not-active-player');
		}
		if (this.isClueGiver) {
			throw new Meteor.Error('clue-giver-cannot-reveal');
		}
		if (this.state.activeTeam === 'setup') {
			throw new Meteor.Error('cannot-reveal-before-game-start');
		}
		const found = this.words.find(o => o.word === word);
		if (!found) {
			throw new Meteor.Error('word-not-found');
		}
		if (found.revealedTeam) { return 1; }  // already revealed
		return promiseCall(Meteor.call, `${CodeNames.prefix}/revealWord`, this._id, word);
	}

	async giveClue(word, number) {
		check(word, String);
		check(number, Number);
		if (!this.isActivePlayer) {
			throw new Meteor.Error('not-active-player');
		}
		if (!this.isClueGiver) {
			throw new Meteor.Error('non-clue-giver-cannot-give-clue');
		}
		if (number < 0 || !Number.isInteger(number)) {
			throw new Meteor.Error('invalid-count');
		}
		return promiseCall(Meteor.call, `${CodeNames.prefix}/giveClue`, this._id, word, number);
	}

	async startGame() {
		if (!this.player) {
			throw new Meteor.Error('player-not-found');
		}
		return promiseCall(Meteor.call, `${CodeNames.prefix}/startGame`, this._id);
	}

	async resetGame() {
		if (!this.player) {
			throw new Meteor.Error('player-not-found');
		}
		if (this.state.activeTeam !== 'ended') {
			throw new Meteor.Error('cannot-reset-when-not-ended');
		}
		return promiseCall(Meteor.call, `${CodeNames.prefix}/resetGame`, this._id);
	}

	async endGame() {
		if (!this.player) {
			throw new Meteor.Error('player-not-found');
		}
		return promiseCall(Meteor.call, `${CodeNames.prefix}/endGame`, this._id);
	}
	// TODO: create invite and join
	async joinGame(alias = '', team = '', role = '') {
		check(alias, String);
		check(team, String);
		check(role, String);
		if (this.player) {
			throw new Meteor.Error('already-in-game');
		}
		return promiseCall(Meteor.call, `${CodeNames.prefix}/revealWord`, this._id, alias, team, role);
	}

	async leave() {}

	async invite() {}
}
CodeNames.prefix = `freelancecourtyard:codenames`;
CodeNames.collection = new Mongo.Collection(`${CodeNames.prefix}Collection`, {
	transform: function(item) {
	  return new CodeNames(item);
	},
});
