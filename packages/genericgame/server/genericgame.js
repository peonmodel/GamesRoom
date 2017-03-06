import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';

import { genericGameSchema } from '../imports/schema.js';

export class Player {
	constructor(item, game) {
		Object.assign(this, item);
		this._game = game;
		Object.defineProperty(this, '_game', { enumerable: false });
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
		this.players = (this.players || []).map(o => { return new Player(o, this); });
		this._suppressUpdate = false;
		Object.defineProperty(this, '_suppressUpdate', { enumerable: false });
		// Object.defineProperty(this, '_collection', { enumerable: false });
	}

	static find(selector, options = {}) {
		if (options.transform === void 0) {
			options.transform = function(item) {
				return new this(item);
			};
		}
		return this.collection.find(selector, options);
	}

	static findOne(selector, options = {}) {
		if (options.transform === void 0) {
			options.transform = function(item) {
				return new this(item);
			};
		}
		return this.collection.findOne(selector, options);
	}

	static registerGame(name, game) {
		if (GenericGame.supportedGames[name]) {
			throw new Meteor.Error('already-registered', name);
		}
		GenericGame.supportedGames[name] = {
			name, game,
		};
	}

	addPlayer({ user, alias, team, role }) {
		if (this.getPlayer(user._id)) {
			throw new Meteor.Error('player-already-joined');
		}
		const player = new Player({ userId: user._id, alias, team, role }, this);
		this.players.push(player);
		const logitem = { timestamp: new Date(), text: `player (${alias}) joined the game` };
		return this._collection.update(this._id, {
			$push: { players: player, log: logitem },
		});
	}

	removePlayer({ user }) {
		this.players = _.without(this.players, this.getPlayer(user._id));
		return this._collection.update(this._id, {
			$set: { players: this.players }
		});
	}

	get player() {
		// only usable in meteor methods
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
GenericGame.collectionName = `freelancecourtyard:genericgame/Collection`;
GenericGame.collection = new Mongo.Collection(`${GenericGame.collectionName}`, {
	transform: function(item) {
		const supported = GenericGame.supportedGames[item.type];
		if (!supported || !supported.game) { return new GenericGame(item); }
	  return new supported.game(item);
	},
	defineMutationMethods: false,
});
GenericGame.collection._ensureIndex({ expiredAt: 1 }, { expireAfterSeconds: 3600 });
GenericGame.supportedGames = {};
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
