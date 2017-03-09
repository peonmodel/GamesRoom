import { Match } from 'meteor/check';

// note that these schema are purely for reference, there is no validation
// of schema on the collection, since mongodb is supposed to be schemaless
// checks if needed should be done upon insertion or other updates

export const genericPlayerSchema = {
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
	players: [genericPlayerSchema],
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

// assign the game specific info over
// specific game should also handle how this info is accessed from the game
export const genericGameInfoSchema = {
	_id: String,
	gameId: String,  // id of game that this is info of
	userIds: [String],  // optional, ids of users privy to this piece of info
	team: [String],  // optional, may classify info by team instead
};
