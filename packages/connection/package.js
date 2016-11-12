Package.describe({
	name: 'freelancecourtyard:connection',
	version: '0.0.1',
	// Brief, one-line summary of the package.
	summary: '',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

Package.onUse((api) => {
	api.versionsFrom('1.4.0.1');
	api.use([
		'ecmascript',
		'accounts-base',
	]);
	api.mainModule('client/connection.js', 'client');
	api.mainModule('server/connection.js', 'server');
});

Package.onTest((api) => {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('freelancecourtyard:connection');
	api.mainModule('test/connection-tests.js');
});
