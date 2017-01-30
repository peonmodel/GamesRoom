import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
// import { check } from 'meteor/check';

import { genericGameSchema } from '../imports/schema.js';

// /**
//  * promiseCall - function to wrap async Meteor functions into returning promises
//  *
//  * @param  {Function} fn - async function to wrap
//  * @param  {Array} params - array of params
//  * @returns {Promise}           resolve if success
//  */
// function promiseCall(fn, ...params) {
// 	return new Promise((resolve, reject) => {
// 		fn(...params, (err, res) => {
// 			if (err) { return reject(err); }
// 			return resolve(res);
// 		});
// 	});
// }

export class Player {
	constructor(item, game) {
		Object.assign(this, item);
		this._game = game;
		Object.defineProperty(this, '_game', { enumerable: false });
	}

	// updateAlias(alias) {
	// 	check(alias, String);
	// 	this.alias = alias;
	// 	return promiseCall(Meteor.call, `${GenericGame.prefix}/updateAlias`, { gameId: this._game._id, alias });
	// }

	// updateTeam(team) {
	// 	check(team, String);
	// 	this.team = team;
	// 	return promiseCall(Meteor.call, `${GenericGame.prefix}/updateTeam`, { gameId: this._game._id, team });
	// }

	// updateRole(role) {
	// 	check(role, String);
	// 	this.role = role;
	// 	return promiseCall(Meteor.call, `${GenericGame.prefix}/updateRole`, { gameId: this._game._id, role });
	// }
}

export class GenericGame {
	constructor(item) {
	  Object.assign(this, item);
		this.players = this.players.map(o => { return new Player(o, this); });
		Object.defineProperty(this, '_collection', { enumerable: false });
	}

	static registerGame(name, game) {
		if (GenericGame.supportedGames[name]) {
			throw new Meteor.Error('already-registered', name);
		}
		GenericGame.supportedGames[name] = {
			name, game,
		};
	}

	get player() {
		const user = Meteor.user() || {};
		return this.getPlayer(user._id);
	}

	getPlayer(id) {
		return this.players.find(o => o.userId === id);
	}

	// addPlayer({ userId, alias, team, role }) {
	// 	const player = new Player({ userId, alias, team, role }, this);
	// 	this.players.push(player);
	// 	const logitem = { timestamp: new Date(), text: `player (${alias}) joined the game` };
	// 	return GenericGame.collection.update(this._id, {
	// 		$push: { players: player, log: logitem },
	// 	});
	// }

}
GenericGame.schema = genericGameSchema;
GenericGame.prefix = `freelancecourtyard:genericgame`;
GenericGame.collection = new Mongo.Collection(`${GenericGame.prefix}Collection`, {
	transform: function(item) {
		const supported = GenericGame.supportedGames[item.type];
		if (!supported || !supported.game) { return new GenericGame(item); }
	  return new supported.game(item);
	},
	defineMutationMethods: false,
});
GenericGame.supportedGames = {};
