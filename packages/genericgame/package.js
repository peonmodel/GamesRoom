Package.describe({
	name: 'freelancecourtyard:genericgame',
	version: '0.0.1',
	// Brief, one-line summary of the package.
	summary: '',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

Package.onUse(function setupPkg(api) {
	api.versionsFrom('1.4.0.1');
	api.use('ecmascript');
	api.mainModule('genericgame-client.js', 'client');
	api.mainModule('genericgame-server.js', 'server');
});

Package.onTest(function setupPkg(api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('freelancecourtyard:genericgame');
	api.mainModule('test/genericgame-tests.js');
});
