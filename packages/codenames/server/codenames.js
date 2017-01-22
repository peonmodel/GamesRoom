import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { GenericGame, genericGameSchema } from 'meteor/freelancecourtyard:genericgame';
import { codeNamesWords } from '../imports/assets/words.js';
import { _ } from 'meteor/underscore';
// import { CodeNamesSchema } from '../imports/schema.js';

// extends generic game class?
export class CodeNames extends GenericGame {
	constructor(item) {
		super(item);
		Object.assign(this, item);
		this._collection = CodeNames.collection;
		Object.defineProperty(this, '_collection', { enumerable: false });
	}

	get isGameInProgress() {
		return !(this.state.activeTeam === 'setup' || this.state.activeTeam === 'ended');
	}

	isActivePlayer(user) {
		if (!this.isGameInProgress) { return false; }
		const player = this.getPlayer(user._id) || {};
		if (player.team !== this.state.activeTeam) { return false; }
		if (this.state.isClueGiven) { return !this.isClueGiver; }
		return this.isClueGiver;
	}

	isClueGiver(user) {
		const player = this.getPlayer(user._id) || {};
		return player.role === 'cluegiver';
	}

	get clueLimit() {
		const last = _.last(this.state.clues);
		if (!last || last.count) { return Infinity; }
		return last.count + 1;
	}

	static createGame({
		name = `Game-${Random.id(4)}`,
		alias,
	} = {}, user = {}) {
		const currentDate = new Date();
		const start = Random.choice([true, false]) ? 'red' : 'blue';
		const words = CodeNames.generateRandomWordsDistribution(start);
		return CodeNames.collection.insert({
			name,
			players: [{
				userId: user._id, alias: alias || user.displayName,
				team: Random.choice(['red', 'blue'])
			}],
			words,
			state: {
				turnCount: 0,
				startingTeam: start,
				isClueGiven: false,
				activeTeam: 'setup',
				clues: [],
				guessCount: 0,
			},
			activePlayerId: '',
			createdAt: currentDate,
			updatedAt: currentDate,
			log: [{ timestamp: currentDate, text: 'game created' }],
		});
	}

	static generateRandomWordsDistribution(start, total = 25) {
		const distribution = CodeNames.generateRandomTeamDistribution(start);
		const words = _.sample(codeNamesWords, total).map((word, idx) => {
			return { word, hiddenTeam: distribution[idx], revealedTeam: '', revealedBy: '' };
		});
		return _.shuffle(words);
	}

	static generateRandomTeamDistribution(start, total = 25, red = 8, blue = 8, yellow = 7, black = 1) {
		if (red + blue + yellow + black + 1 !== 25) {
			throw new Meteor.Error('invalid distribution');
		}
		return [
			...Array.from({ length: red }).map(() => 'red'),
			...Array.from({ length: blue }).map(() => 'blue'),
			...Array.from({ length: yellow }).map(() => 'yellow'),
			...Array.from({ length: black }).map(() => 'black'),
			start,
		];
	}

	resetWords() {
		if (this.state.activeTeam !== 'setup') {
			throw new Meteor.Error('cannot-change-after-game-start');
		}
		const start = Random.choice([true, false]) ? 'red' : 'blue';
		this.words = CodeNames.generateRandomWordsDistribution(start);
		const logItem = {
			timestamp: new Date(),
			text: 'reset words',
		};
		this.log.push(logItem);
		return this._collection.update(this._id, {
			$set: { words: this.words },
			$push: { log: logItem },
		});
	}

	changeWord(word) {
		if (this.state.activeTeam !== 'setup') {
			throw new Meteor.Error('cannot-change-after-game-start');
		}
		const index = this.words.findIndex(o => o.word === word);
		if (index < 0) {
			throw new Meteor.Error('word-not-found');
		}
		const randomSet = _.sample(codeNamesWords, this.words.length + 1);
		const newWord = randomSet.find(candidate => {
			return !this.words.find(o => o.word === candidate);
		});
		this.words[index].word = newWord;
		const logItem = {
			timestamp: new Date(),
			text: 'change word',
		};
		this.log.push(logItem);
		return this._collection.update(this._id, {
			$set: { [`words.${index}.word`]: this.words[index].word },
			$push: { log: logItem },
		});
	}

	_changeActiveTeam() {
		this.state.guessCount = 0;
		this.state.activeTeam = this.state.activeTeam === 'red' ? 'blue' : 'red';
		this.state.turnCount += 1;
	}

	_endGame(win = false) {
		if (win) {
			this.state.winningTeam = this.state.activeTeam;
		} else {
			this.state.winningTeam = (this.state.activeTeam === 'red' ? 'blue' : 'red');
		}
		this.state.activeTeam = 'ended';
	}

	_countWords(team) {
		let max = 0;
		let current = 0;
		this.words.forEach(o => {
			if (o.revealedTeam === team) { current += 1; }
			if (o.hiddenTeam === team) { max += 1; }
		});
		return { max, current };
	}

	revealWord(word, user) {
		if (this.state.activeTeam === 'setup') {
			throw new Meteor.Error('cannot-reveal-before-game-start');
		}
		const player = this.getPlayer(user._id);
		const item = this.words.find(o => o.word === word);
		if (!item) { throw new Meteor.Error('word-not-found'); }
		if (item.revealedTeam) { return 1; }  // already revealed
		item.revealedTeam = item.hiddenTeam;
		item.revealedBy = player.team;
		this.state.guessCount += 1;
		if (item.revealedTeam === 'black') {
			this._endGame();  // if black, end game with loss
		} else if (item.revealedTeam === 'yellow') {
			this._changeActiveTeam();  // if yellow just change team
		} else {
			const { max, current } = this._countWords(item.hiddenTeam);
			if (current === max) {  // if all revealed
				this._endGame(item.hiddenTeam === player.team);  // win is color is activeTeam
			} else {
				if (item.revealedTeam !== player.team || this.state.guessCount >= this.clueLimit) {
					this._changeActiveTeam();  // this.state is mutated
				} else {
					this.state.guessCount += 1;  // if correct guess & within limit, just increment
				}
			}
		}
		return this._collection.update({
			_id: this._id,
			[`words.word`]: word,
		}, {
			$set: {
				[`state`]: this.state,
				[`words.$.revealedTeam`]: item.hiddenTeam,
				[`words.$.revealedBy`]: item.revealedBy
			},
		});
	}

	giveClue(word, number, user) {
		if (this.state.isClueGiven) {
			throw new Meteor.Error('clue-already-given');
		}
		if (number < 0 || !Number.isInteger(number)) {
			throw new Meteor.Error('invalid-count');
		}
		const player = this.getPlayer(user._id);
		const clue = { clue: word, count: number, team: player.team };
		this.state.clues.push(clue);
		this.state.isClueGiven = true;
		return this._collection.update(this._id, {
			$set: { [`state.isClueGiven`]: true, [`state.guessCount`]: number },
			$push: { [`state.clues`]: clue },
		});
	}

	resetGame() {
		if (this.state.activeTeam !== 'ended') {
			throw new Meteor.Error('cannot-reset-when-not-ended');
		}
		const start = Random.choice([true, false]) ? 'red' : 'blue';
		this.state = {
			turnCount: 0,
			activeTeam: 'setup',
			isClueGiven: false,
			startingTeam: start,
			guessCount: 0,
			clues: [],
		};
		this.words = CodeNames.generateRandomWordsDistribution(start);
		const logItem = {
			timestamp: new Date(),
			text: 'reset game',
		};
		this.log.push(logItem);
		return this._collection.update({
			_id: this._id,
		}, {
			$set: {
				state: this.state,
				words: this.words,
			},
			$push: { log: logItem },
		});
	}

	startGame() {
		if (this.state.activeTeam !== 'setup') {
			throw new Meteor.Error('can-only-start-after-setup');
		}
		// check the right player counts
		if (!this.getClueGiver('red') || !this.getClueGiver('blue')) {
			throw new Meteor.Error('no-clue-giver');
		}
		// TODO: check guesser
		this.state.activeTeam = this.state.startingTeam;
		this.state.turnCount += 1;
		return this._collection.update(this._id, {
			$set: { state: this.state },
		});
	}

	endGame() {
		this.state.activeTeam = 'ended';
		return this._collection.update(this._id, {
			$set: { [`state.activeTeam`]: this.state.activeTeam },
		});
	}

	getClueGiver(team) {
		return this.players.find(o => o.team === team && o.role === 'cluegiver');
	}

	joinGame({ user, alias, team, role } = {}) {
		alias = alias || user.username;
		team = team || Random.choice(['red', 'blue']);
		role = role || (this.getClueGiver(team) ? 'others' : 'cluegiver');
		return this.addPlayer({ user, alias, team, role });
	}

	leaveGame(user) {
		return this.removePlayer(user);
	}
}

CodeNames.teams = ['red', 'blue', 'yellow', 'black'];
CodeNames.roles = ['cluegiver', 'others'];
CodeNames.prefix = `freelancecourtyard:codenames`;
CodeNames.schema = Object.assign(genericGameSchema, {
	words: [{ word: String, hiddenTeam: String, revealedTeam: String, revealedBy: String }],
	state: {
		turnCount: Number,
		activeTeam: String,  // setup, red, blue, ended
		isClueGiven: Boolean,
		startingTeam: String,
		guessCount: Number,
		clues: [{ clue: String, count: Number, team: String }],
	},
});
CodeNames.collection = new Mongo.Collection(`${CodeNames.prefix}Collection`, {
	transform: function(item) {
	  return new CodeNames(item);
	},
	defineMutationMethods: false,
});
// using specific collection instead of generic collection
// due to problems with specific transform for collection
