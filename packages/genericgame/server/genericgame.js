import { Meteor } from 'meteor/meteor';
// import { Mongo } from 'meteor/mongo';
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
		this.players = this.players.map(o => { return new Player(o, this); });
		this._suppressUpdate = false;
		Object.defineProperty(this, '_suppressUpdate', { enumerable: false });
		// Object.defineProperty(this, '_collection', { enumerable: false });
	}

	// static createStuff(collection, ...params) {
	// 	// need to take in collection as a params for static functions
	// }

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

	removePlayer(user) {
		this.players = _.without(this.players, this.getPlayer(user._id));
		return this._collection.update(this._id, {
			$set: { players: this.players }
		});
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
// GenericGame.prefix = `freelancecourtyard:genericgame`;
// GenericGame.collection = new Mongo.Collection(`${GenericGame.prefix}Collection`, {
// 	transform: function(item) {
// 	  return new GenericGame(item);
// 	},
// 	defineMutationMethods: false,
// });
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
