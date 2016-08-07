// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by task.js.
import { name as packageName } from "meteor/freelancecourtyard:task";

// Write your tests here!
// Here is an example.
Tinytest.add('task - example', function (test) {
  test.equal(packageName, "task");
});
