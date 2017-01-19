import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { GenericGame, genericGameSchema } from 'meteor/freelancecourtyard:genericgame';
// import { CodeNamesSchema } from '../imports/schema.js';

// extends generic game class?
export class CodeNames extends GenericGame {
	constructor(item) {
		super(item);
		Object.assign(this, item);
	}

	static createGame({
		name = `Game${Random.id(4)}`,
		alias,
	} = {}, user = undefined) {
		const currentDate = new Date();
		return CodeNames.collection.insert({
			name,
			players: [{
				userId: user._id, alias: alias || user.displayName,
				team: Random.choice(['red', 'blue'])
			}],
			activePlayerId: '',
			createdAt: currentDate,
			updatedAt: currentDate,
			log: [{ timestamp: currentDate, text: 'game created' }],
		});
	}

	isClueGiver(userId) {
		const player = this.getPlayer(userId) || {};
		return player.role === 'cluegiver';
	}

	revealWord(word) {
		const item = this.words.find(o => o.word === word);
		if (!item) { throw new Meteor.Error('word-not-found'); }
		if (item.revealedTeam) { return 1; }  // already revealed
		item.revealedTeam = item.hiddenTeam;
		return CodeNames.collection.update({
			_id: this._id,
			[`words.word`]: word,
		}, {
			$set: { [`words.$.revealedTeam`]: item.hiddenTeam },
		}, () => {});
	}
}

CodeNames.teams = ['red', 'blue', 'yellow', 'black'];
CodeNames.roles = ['cluegiver', 'others'];
CodeNames.prefix = `freelancecourtyard:codenames`;
CodeNames.schema = Object.assign(genericGameSchema, {
	words: [{ word: String, hiddenTeam: String, revealedTeam: String }],
});
CodeNames.collection = new Mongo.Collection(`${CodeNames.prefix}Collection`, {
	transform: function(item) {
	  return new CodeNames(item);
	},
	defineMutationMethods: false,
});
// using specific collection instead of generic collection
// due to problems with specific transform for collection
