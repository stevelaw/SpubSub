## What is it?

A pubsub implementation that stores messages prior to publishing to 
subscribers.  I like to refer to it as a "Store and Forward PubSub".

## What Does SpubSub Stand For?

The pubsub stores messages for future retrieval prior to publishing the 
message.  The "S" stands for "Store".

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