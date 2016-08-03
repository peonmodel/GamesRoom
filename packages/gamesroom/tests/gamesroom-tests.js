// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by gamesroom.js.
import { name as packageName } from "meteor/freelancecourtyard:gamesroom";

// Write your tests here!
// Here is an example.
Tinytest.add('gamesroom - example', function (test) {
  test.equal(packageName, "gamesroom");
});
