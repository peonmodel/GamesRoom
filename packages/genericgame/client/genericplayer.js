import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { GenericGame } from './genericgame.js';

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

export class GenericPlayer {
	constructor(item, game) {
		Object.assign(this, item);
		this._game = game;
		Object.defineProperty(this, '_game', { enumerable: false });
	}

	updateAlias(alias) {
		check(alias, String);
		this.alias = alias;
		return promiseCall(Meteor.call, `${GenericGame.prefix}/updateAlias`, { gameId: this._game._id, alias });
	}

	updateTeam(team) {
		check(team, String);
		this.team = team;
		return promiseCall(Meteor.call, `${GenericGame.prefix}/updateTeam`, { gameId: this._game._id, team });
	}

	updateRole(role) {
		check(role, String);
		this.role = role;
		return promiseCall(Meteor.call, `${GenericGame.prefix}/updateRole`, { gameId: this._game._id, role });
	}
}
