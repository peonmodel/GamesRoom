// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by chat.js.
import { name as packageName } from "meteor/freelancecourtyard:chat";

// Write your tests here!
// Here is an example.
Tinytest.add('chat - example', function (test) {
  test.equal(packageName, "chat");
});
