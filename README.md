# GamesRoom

pattern for template events using async-await
```javascript
events({
	[`click`]: async function clickSomething(event, instance) {
		// note the use of 'async' keyword is required for 'await',
		// use a try-catch block to wrap every await, since every await may fail 
		try {
			// asyncPromiseFn is a prototype method on the various classes and returns a promise
			var result = await instance.data.item.asyncPromiseFn();  
			// var is used deliberately to be not scoped to within the try block
		} catch (e) {
			console.error(e)
		} finally {
			// clean up
		}
		console.log(result)
		// other stuff
	},
	[`click .another`]: async function clickAnother(event, instance) {
		try {
			// Promise.all / Promise.race can be used
			var [result1, result2] = await Promise.all([instance.data.item.asyncPromiseFn(), anotherPromise()]);  
			// var is used deliberately to be not scoped to within the try block
		} catch (e) {
			console.error(e)
		} finally {
			// clean up
		}
		console.log(result1, result2)
		// other stuff
	},
});
```

## TODO:
* ~~create define methods for chat class~~
* ~~split chat & message js file~~
* ~~create client-side class for chat~~
* ~~add publication for chat~~
* ~~add collection as part of class static variable~~
* ~~add unblock to method calls~~
* ~~add documentation for chat-server package~~
* add documentation for chat-client package
* add documentation for message package
* split Chat and Message package
* test chat package
* create define methods for room class
* create client-side class for room
* add documentation for room package
* test room package
* create players/users package
* update Chat tests when players/users package is written
* add client-side collection for simulation
* consider add lodash
