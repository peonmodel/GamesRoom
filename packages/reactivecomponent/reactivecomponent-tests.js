// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by reactivecomponent.js.
import { name as packageName } from "meteor/freelancecourtyard:reactivecomponent";

// Write your tests here!
// Here is an example.
Tinytest.add('reactivecomponent - example', function (test) {
  test.equal(packageName, "reactivecomponent");
});
