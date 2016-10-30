// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by genericgame.js.
import { name as packageName } from "meteor/freelancecourtyard:genericgame";

// Write your tests here!
// Here is an example.
Tinytest.add('genericgame - example', function (test) {
  test.equal(packageName, "genericgame");
});
