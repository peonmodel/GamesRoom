import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { genericGameSchema } from '../imports/schema.js';

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

export class GenericGame {
	constructor(item) {
	  Object.assign(this, item);
		// due to publication secrecy, players array may be undefined
		this.players = (this.players || []).map(o => { return new GenericPlayer(o, this); });
		Object.defineProperty(this, '_collection', { enumerable: false });
	}

	static find(selector = {}, options = {}) {
		if (options.transform === void 0) {
			options.transform = (item) => {
				return new this(item);
			};
		}
		return this.collection.find(selector, options);
	}

	static findOne(selector = {}, options = {}) {
		if (options.transform === void 0) {
			options.transform = (item) => {
				return new this(item);
			};
		}
		return this.collection.findOne(selector, options);
	}

	// static registerGame(name, game) {
	// 	if (GenericGame.supportedGames[name]) {
	// 		throw new Meteor.Error('already-registered', name);
	// 	}
	// 	GenericGame.supportedGames[name] = {
	// 		name, game,
	// 	};
	// }

	get player() {
		const user = Meteor.user() || {};
		return this.getPlayer(user._id);
	}

	getPlayer(id) {
		return this.players.find(o => o.userId === id);
	}

	// addPlayer({ userId, alias, team, role }) {
	// 	const player = new GenericPlayer({ userId, alias, team, role }, this);
	// 	this.players.push(player);
	// 	const logitem = { timestamp: new Date(), text: `player (${alias}) joined the game` };
	// 	return GenericGame.collection.update(this._id, {
	// 		$push: { players: player, log: logitem },
	// 	});
	// }

}
GenericGame.schema = genericGameSchema;
GenericGame.prefix = `freelancecourtyard:genericgame`;
GenericGame.collectionName = `freelancecourtyard:genericgame/Collection`;
GenericGame.collection = new Mongo.Collection(`${GenericGame.collectionName}`, {
	transform: function(item) {
		return new GenericGame(item);
		// const supported = GenericGame.supportedGames[item.type];
		// if (!supported || !supported.game) { return new GenericGame(item); }
	  // return new supported.game(item);
	},
	defineMutationMethods: false,
});
GenericGame.supportedGames = {};
