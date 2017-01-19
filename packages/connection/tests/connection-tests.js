// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by connection.js.
import { name as packageName } from "meteor/freelancecourtyard:connection";

// Write your tests here!
// Here is an example.
Tinytest.add('connection - example', function (test) {
  test.equal(packageName, "connection");
});
