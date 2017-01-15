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
		const user = Meteor.user();
		// due to issues with how meteor deals with bad connections
		// this method is executed twice when user account is changed
		if (!user) { return 1; }
		return Connection.registerGuest(user, username, hashed, email);
	},
	[`${Connection.prefix}/createUser`]: function(username, hashed, email) {
		check(username, String);
		check(hashed, { algorithm: String, digest: String });
		check(email, String);
		return Connection.createUser(username, hashed, email);
	},
	[`${Connection.prefix}/checkRegisterGuest`]: function(username, hashed, email) {
		check(username, String);
		check(hashed, { algorithm: String, digest: String });
		check(email, String);
		const user = Meteor.user();
		return Connection.checkRegisterGuest(user, username, hashed, email);
	},
});
