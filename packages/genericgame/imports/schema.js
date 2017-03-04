import { Match } from 'meteor/check';

// note that these schema are purely for reference, there is no validation
// of schema on the collection, since mongodb is supposed to be schemaless
// checks if needed should be done upon insertion or other updates

export const playerSchema = {
	userId: String,  // 1 player per user per game
	alias: String,  // a different alias for each game
	team: Match.Maybe(String),
	role: Match.Maybe(String),
};

export const logItem = {
	timestamp: Date,
	text: String,
};

export const genericGameSchema = {
	name: String, // name of game
	type: String,
	players: [playerSchema],
	// activePlayerId: String,
	hostedBy: String,
	createdAt: Date,
	updatedAt: Date,
	expiredAt: Date,  // optional
	log: [logItem],
	state: Object,
	minPlayers: Number,
	maxPlayers: Number,
};
