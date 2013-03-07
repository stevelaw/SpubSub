## What is it?

A pubsub implementation that stores messages prior to publishing to 
subscribers.  

It is a universal module, and will therefore work anywhere, be it in the 
client, on the server or anywhere else.

It is compatibile with the most popular script loaders of the day 
(e.g RequireJS amongst others), and in many cases uses AMD as a base, 
with special-casing added to handle CommonJS compatability.

## What Does SpubSub Stand For?

The "S" stands for "Store".  I like to refer to it as a "Store and Forward 
PubSub".

## Dependencies

None

## API

```
subscribe(options)
	where 
		options.key 
			A String or RegExp object, or an array of String and/or RegExp 
			objects.
		options.fn 
			Callback executed when a matched message key is stored.
		options.once 
			Removes the subscriber after the first notification.
		
	returns 
		A handle that can be passed to unsubscribe.	

unsubscribe(handle, listener)
	where 
		handle
			A String, RegExp, or a handle returned from subscribe. If handle 
			is a String, the listener must be the listener function.
		
		listener
			Required if key is a String or RegExp.
		
	returns
		The number of listeners that were unsubscribed.	
		
store(key, val)	

fetch(key)

remove(key)

removeAll()	 
```

## Usage

### Simple Subscribe and Store
```
var spubSub = SpubSub();

spubSub.subscribe({
	key: "test",
	fn: function(key, msg) {
		// Do something
	}
});
		
spubSub.store("test", {});		
```

### Subscribe Using Key Array
```
var spubSub = SpubSub();

spubSub.subscribe({
	key: [ "test1", "test2", "test3" ],
	fn: function(key, msg) {
		// I'm called 3 times
	}
});		
		
spubSub.store("test1", {});
spubSub.store("test2", {});
spubSub.store("test3", {});		
```

### Subscribe Using RegExp Object
```
var spubSub = SpubSub();

spubSub.subscribe({
	key : new RegExp("(t|r|b)est"),
	fn : function(key, msg) {
		// Key will be the matching regex (test, best, rest).
	}
});

spubSub.store("test");
spubSub.store("best");
spubSub.store("rest");		
```

### Publish Using Topic Hierarchy and Wildcard
```
var spubSub = SpubSub();
		
spubSub.subscribe({
	key : "/level1/level2/level3",
	fn : function(key, msg) {
		// Will be called twice
	}
});

spubSub.store("/level1/*");
spubSub.store("/level1/level2/*");
```

### Publish Using Topic Hierarchy, Wildcard, and Custom Topic Separator
```
var spubSub = SpubSub({
	topicSeparator: "."
});
		
spubSub.subscribe({
	key : "level1.level2.level3",
	fn : function(key, msg) {
		// Will be called twice
	}
});

spubSub.store("level1.*");
spubSub.store("level1.level2.*");
```

### Unsubscribe Using Subscribe Handle
```
var spubSub = SpubSub();
		
var handle = spubSub.subscribe({
	key : "test",
	fn : fn
});

var num = spubSub.unsubscribe(handle);
```

### Unsubscribe Using Key and Function
```
var spubSub = SpubSub();
		
var key = "test";
var fn = function(){};
		
var handle = spubSub.subscribe({
	key : key,
	fn : fn
});

var num = spubSub.unsubscribe(key, fn);
```

### Delete a Stored Key
```
var spubSub = SpubSub();
		
spubSub.store("test", {});
spubSub.remove("test");
```

### Retrieve a Stored Key
```
var spubSub = SpubSub();
		
spubSub.store("test", {});
spubSub.fetch("test");
```