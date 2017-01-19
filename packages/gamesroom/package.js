Package.describe({
	name: 'freelancecourtyard:gamesroom',
	version: '0.0.1',
	// Brief, one-line summary of the package.
	summary: '',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

// Npm.depends({
//   'lodash': '4.14.1',
// });

Package.onUse((api) => {
	api.versionsFrom('1.4');
	api.use([
	  'ecmascript',
	  'mongo',
	  'check',
	  'random',
	  'accounts-password',
	]);
	api.imply([
	  'accounts-password',
	]);
	api.use([
	  'freelancecourtyard:chatmessages',
	]);
	api.mainModule('gamesroom-client.js', 'client');
	api.mainModule('gamesroom-server.js', 'server');
});

Package.onTest((api) => {
  // utility
	api.use([
	  'ecmascript',
	  // 'underscore',
	  'mongo',
	]);
	// test engine
	api.use([
	  'practicalmeteor:mocha',
	  'practicalmeteor:chai',
	  // 'practicalmeteor:sinon',
	]);
	// package to test
	api.use('freelancecourtyard:gamesroom');
	api.mainModule('tests/gamesroom-tests.js');
});
