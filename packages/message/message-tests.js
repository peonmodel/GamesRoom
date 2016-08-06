// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by message.js.
import { name as packageName } from "meteor/freelancecourtyard:message";

// Write your tests here!
// Here is an example.
Tinytest.add('message - example', function (test) {
  test.equal(packageName, "message");
});
