import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { genericGameSchema } from '../imports/schema.js';

export class Player {
	constructor(item, game) {
		Object.assign(this, item);
		this._game = game;
		Object.defineProperty(this, '_game', { enumerable: false });
	}

	updateAlias(alias) {
		check(alias, String);
		this.alias = alias;
		return new Promise((resolve, reject) => {
			Meteor.call(`${GenericGame.prefix}/updateAlias`, {  // eslint-disable-line no-use-before-define
				gameId: this._game._id, alias
			}, (err, res) => {
				if (err) { reject(err); }
				resolve(res);
			});
		});
	}

	updateTeam(team) {
		check(team, String);
		this.team = team;
		return new Promise(function(resolve, reject) {
			Meteor.call(`${GenericGame.prefix}/updateTeam`, {  // eslint-disable-line no-use-before-define
				gameId: this._game._id, team
			}, (err, res) => {
				if (err) { reject(err); }
				resolve(res);
			});
		});
	}

	updateRole(role) {
		check(role, String);
		this.role = role;
		return new Promise(function(resolve, reject) {
			Meteor.call(`${GenericGame.prefix}/updateTeam`, {  // eslint-disable-line no-use-before-define
				gameId: this._game._id, role
			}, (err, res) => {
				if (err) { reject(err); }
				resolve(res);
			});
		});
	}
}

export class GenericGame {
	constructor(item) {
	  Object.assign(this, item);
		this.players = this.players.map(o => { return new Player(o, this); });
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

}
GenericGame.schema = genericGameSchema;
GenericGame.prefix = `freelancecourtyard:genericgame`;
GenericGame.collection = new Mongo.Collection(`${GenericGame.prefix}Collection`, {
	transform: function(item) {
	  return new GenericGame(item);
	},
	defineMutationMethods: false,
});
