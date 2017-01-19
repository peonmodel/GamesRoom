// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by codenames.js.
import { name as packageName } from "meteor/freelancecourtyard:codenames";

// Write your tests here!
// Here is an example.
Tinytest.add('codenames - example', function (test) {
  test.equal(packageName, "codenames");
});
