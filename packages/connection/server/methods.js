import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Connection } from './connection.js';

Meteor.methods({
	[`${Connection.prefix}/createGuest`]: function(username) {
		check(username, String);
		return Connection.createGuest(username);
	},
	[`${Connection.prefix}/registerGuest`]: function(username, hashed, email) {
		check(username, String);
		check(hashed, { algorithm: String, digest: String });
		check(email, String);
		return Connection.registerGuest(Meteor.user(), username, hashed, email);
	},
	[`${Connection.prefix}/createUser`]: function(username, hashed, email) {
		check(username, String);
		check(hashed, { algorithm: String, digest: String });
		check(email, String);
		return Connection.createUser(username, hashed, email);
	},
});
