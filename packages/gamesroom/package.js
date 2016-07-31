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

Npm.depends({
  'lodash': '4.14.1',
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use([
    'ecmascript',
    'mongo',
    'check',
    'accounts-password',
  ]);

  api.imply([
    'accounts-password',
  ]);

  api.mainModule('gamesroom.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('freelancecourtyard:gamesroom');
  api.mainModule('gamesroom-tests.js');
});
