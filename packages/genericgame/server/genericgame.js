import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
// import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { genericGameSchema } from '../imports/schema.js';

// function hasConflict(mod1, mod2) {
// 	// not very interested in operators that is not used; [ $min, $max, $rename, $inc, $mul ]
// 	// only interested in [ $set, $unset, $push, $pop ]

// 	// cannot set & push the same field at the same time

// 	// return true if any fields are the same between $push & set
// 	// return true if any field is subfield
// 	return true;
// }

export class GenericPlayer {
	constructor(item, index, game) {
		Object.assign(this, item);
		Object.defineProperty(this, '_game', { enumerable: false, value: game });
		Object.defineProperty(this, '_index', { enumerable: false, writable: true, value: index });
	}

	updateAlias(alias) {
		this.alias = alias;
		return this.update();
	}

	updateTeam(team) {
		this.team = team;
		return this.update();
	}

	updateRole(role) {
		this.role = role;
		return this.update();
	}

	update() {
		if (!this._game._suppressUpdate) {
			return this._game._collection.update({ '_id': this._game._id, 'players.userId': this.userId }, {  // eslint-disable-line no-use-before-define
				$set: { 'players.$': this },
			});
		}
	}
}

export class GenericGame {
	constructor(item) {
	  Object.assign(this, item);
		// due to publication secrecy, players array may be undefined
		this.players = (this.players || []).map((o, idx) => { return new GenericPlayer(o, idx, this); });
		Object.defineProperty(this, '_suppressUpdate', { enumerable: false, writable: true, value: false });
		Object.defineProperty(this, '_modifiers', { enumerable: false, writable: true, value: [] });
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

	updateCollections() {
		const promises = this._modifiers.map(mod => {
			return new Promise((resolve, reject) => {
				GenericGame.collection.update({ _id: this._id }, mod, (error, result) => {
					return !!error ? reject(error) : resolve(result);
				});
			});
		});
		return Promise.all(promises);
	}

	// batchUpdates() {
	// 	const batchArray = [];
	// 	let lastbatch = {};
	// 	this._modifiers.forEach(operation => {
	// 		if (!hasConflict(lastbatch.modifier, operation.modifier)) {
	// 			Object.assign(lastbatch.modifier, operation.modifier);
	// 		} else {
	// 			// new batch
	// 			lastbatch = operation;
	// 			batchArray.push(lastbatch);
	// 		}
	// 	});
	// 	this._modifiers = batchArray;
	// 	return this._modifiers;
	// }

	// /**
	//  * createGame - create a game
	//  *
	//  * @static
	//  * @param {Object} gameObj - properties of game
	//  * @param {String} [gameObj.name] - name of the game
	//  * @param {GenericPlayer[]} [gameObj.players] - array of players in the game
	//  * @param {User} [user={}] - user
	//  * @param {String} [alias=''] - optional alias for first player
	//  * @returns {String} - id of game created
	//  *
	//  * @memberOf GenericGame
	//  */
	// static createGame({
	// 	name = `Game-${Random.id(4)}`,
	// 	players,
	// } = {}, user = {}) {
	// 	const currentDate = new Date();

	// 	return this.collection.insert({
	// 		type: 'GenericGame',
	// 		name, players,
	// 		state: {},
	// 		hostedBy: user._id,
	// 		createdAt: currentDate,
	// 		updatedAt: currentDate,
	// 		log: [{ timestamp: currentDate, text: 'game created' }],
	// 	});
	// }

	get player() {
		const user = Meteor.user() || {};
		return this.getPlayer(user._id);
	}

	getPlayer(id) {
		return this.players.find(o => o.userId === id);
	}

	checkPlayerInGame(id) {
		if (!this.getPlayer(id)) {
			throw new Meteor.Error('player-not-in-game');
		}
		return true;
	}
}
GenericGame.schema = genericGameSchema;
GenericGame.prefix = `freelancecourtyard:genericgame`;
GenericGame.collectionName = `freelancecourtyard:genericgame/Collection`;
GenericGame.collection = new Mongo.Collection(`${GenericGame.collectionName}`, {
	transform: function(item) {
		return new GenericGame(item);
	},
	defineMutationMethods: false,
});
GenericGame.collection._ensureIndex({ expiredAt: 1 }, { expireAfterSeconds: 3600 });

// phase > round > turn > action
// Action:
// 1) before action interrupt FILO
// 2) action itself
// 3) side-effects
// 4) after action interrupt FIFO
// In-between Action interrupt - FIFO
// this interrupt is before action is taken before knowing
// what action is going to be played
// interrupt priority options:
// following pre-defined game sequence
// 1) designated - start player / special effects etc
// 2) action-taker
// 3) current player (turn)
// 4) right after action-taker
