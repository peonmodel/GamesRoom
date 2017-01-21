Package.describe({
	name: 'freelancecourtyard:codenames',
	version: '0.0.1',
	// Brief, one-line summary of the package.
	summary: '',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

Npm.depends({
	'react': '15.4.1',
	'semantic-ui-react': '0.62.0',
});

Package.onUse(function setupPkg(api) {
	api.versionsFrom('1.4.2.3');
	api.use(['ecmascript', 'freelancecourtyard:genericgame@0.0.1']);
	api.mainModule('codenames-client.js', 'client');
	api.mainModule('codenames-server.js', 'server');
});

Package.onTest(function setupPkg(api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('freelancecourtyard:codenames');
	api.mainModule('tests/codenames-tests.js');
});
