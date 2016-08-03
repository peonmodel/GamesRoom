Package.describe({
  name: 'freelancecourtyard:chatmessages',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use([
    'ecmascript',
    'mongo',
    'check',
    'underscore',
  ]);
  api.mainModule('chatmessages-server.js', 'server');
  api.mainModule('chatmessages-client.js', 'client');
});

Package.onTest(function(api) {
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
  api.use('freelancecourtyard:chatmessages');
  api.mainModule('tests/chat-server-spec.js', 'server');
});
