import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { genericGameSchema } from '../imports/schema.js';
import { GenericPlayer } from './genericplayer.js';

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

	get player() {
		const user = Meteor.user() || {};
		return this.getPlayer(user._id);
	}

	getPlayer(id) {
		return this.players.find(o => o.userId === id);
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
