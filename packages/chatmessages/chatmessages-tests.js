// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by chatmessages.js.
import { name as packageName } from "meteor/freelancecourtyard:chatmessages";

// Write your tests here!
// Here is an example.
Tinytest.add('chatmessages - example', function (test) {
  test.equal(packageName, "chatmessages");
});
