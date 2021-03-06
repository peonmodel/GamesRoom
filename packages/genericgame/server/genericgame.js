import { Mongo } from 'meteor/mongo';

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
			return GenericGame.collection.update({ '_id': this._game._id, 'players.userId': this.userId }, {  // eslint-disable-line no-use-before-define
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
	}

	static createGame() {}

	addPlayer({ userId, alias, team, role }) {
		const player = new Player({ userId, alias, team, role }, this);
		this.players.push(player);
		const logitem = { timestamp: new Date(), text: `player (${alias}) joined the game` };
		return GenericGame.collection.update(this._id, {
			$push: { players: player, log: logitem },
		});
	}

	getPlayer(id) {
		return this.players.find(o => o.userId === id);
	}

}
GenericGame.schema = genericGameSchema;
GenericGame.prefix = `freelancecourtyard:genericgame`;
GenericGame.collection = new Mongo.Collection(`${GenericGame.prefix}Collection`, {
	transform: function(item) {
	  return new GenericGame(item);
	},
	defineMutationMethods: false,
});
