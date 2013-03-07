describe("SpubSub", function() {
	var spubSub = null;

	beforeEach(function() {
		spubSub = SpubSub();
	});

	it("should not be null", function() {
		expect(spubSub).not.toBeNull();
	});

	it("should be defined", function() {
		expect(spubSub).toBeDefined();
	});

	it('can store with no subscribers', function() {
		var keyUnderTest = "key";
		spubSub.store(keyUnderTest);
	});

	it("can subscribe with one key", function() {
		var keyUnderTest = "key";
		var fired = false;

		spubSub.subscribe({
			key : keyUnderTest,
			fn : function(key, msg) {
				fired = true;
			}
		});

		spubSub.store(keyUnderTest, true);

		waitsFor(function() {
			return fired;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(true);
		});

	});

	it("can remove subscriber configured as once", function() {
		var keyUnderTest = "key";
		var fired = false;

		spubSub.subscribe({
			key : keyUnderTest,
			once: true,
			fn : function(key, msg) {
				fired = true;
			}
		});

		spubSub.store(keyUnderTest);

		waitsFor(function() {
			return fired;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(true);
		});

		runs(function() {
			fired = false;
			spubSub.store(keyUnderTest);
		});
		
		waits(0);
		
		runs(function() {
			expect(fired).toEqual(false);
		});
	});
	
	it("can subscribe with many keys in one subscribe", function() {
		var keysUnderTest = [ "key1", "key2", "key3", "key4", "key5" ];
		var fired = 0;

		spubSub.subscribe({
			key : keysUnderTest,
			fn : function(key, msg) {
				fired++;
			}
		});

		keysUnderTest.forEach(function(key) {
			spubSub.store(key, true);
		});

		waitsFor(function() {
			return fired === keysUnderTest.length;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(keysUnderTest.length);
		});

	});
	
	it("can remove many subscribers configured as once", function() {
		var keysUnderTest = [ "key1", "key2", "key3", "key4", "key5" ];
		var fired = 0;

		spubSub.subscribe({
			key : keysUnderTest,
			once: true,
			fn : function(key, msg) {
				fired++;
			}
		});

		for(var i = 0, len = keysUnderTest.length; i< len; i++) {
			spubSub.store(keysUnderTest[i], true);
		}

		waitsFor(function() {
			return fired === keysUnderTest.length;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(keysUnderTest.length);
		});

		runs(function() {
			fired = 0;
		
			for(var i = 0, len = keysUnderTest.length; i< len; i++) {
				spubSub.store(keysUnderTest[i]);
			}
		});
		
		waits(0);
		
		runs(function() {
			expect(fired).toEqual(0);
		});
	});

	it("can subscribe with many keys in many subscribe", function() {
		var keysUnderTest = [ "key1", "key2", "key3", "key4", "key5" ];
		var fired = 0;

		keysUnderTest.forEach(function(key) {
			spubSub.subscribe({
				key : key,
				fn : function(key, msg) {
					fired++;
				}
			});
		});

		keysUnderTest.forEach(function(key) {
			spubSub.store(key, true);
		});

		waitsFor(function() {
			return fired === keysUnderTest.length;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(keysUnderTest.length);
		});

	});

	it("can subscribe with many keys in many subscribe", function() {
		var keysUnderTest = [ "key1", "key2", "key3", "key4", "key5" ];
		var fired = 0;

		keysUnderTest.forEach(function(key) {
			spubSub.subscribe({
				key : key,
				fn : function(key, msg) {
					fired++;
				}
			});
		});

		keysUnderTest.forEach(function(key) {
			spubSub.store(key, true);
		});

		waitsFor(function() {
			return fired === keysUnderTest.length;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(keysUnderTest.length);
		});

	});

	it("can publish in order of subscription", function() {
		var keysUnderTest = [ "key1", "key2", "key3", "key4", "key5" ];
		var received = [];

		spubSub.subscribe({
			key : keysUnderTest,
			fn : function(key, msg) {
				received.push(key);
			}
		});

		keysUnderTest.forEach(function(key) {
			spubSub.store(key, true);
		});

		waitsFor(function() {
			return received.length === keysUnderTest.length;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(received).toEqual(keysUnderTest);
		});

	});

	it("can subscribe with regular expression", function() {
		var keyUnderTest = new RegExp("(t|r|b)est");
		var keysToStore = ["test", "best", "rest"];
		var fired = 0;

		spubSub.subscribe({
			key : keyUnderTest,
			fn : function(key, msg) {
				fired++;
			}
		});

		for(var i =0, len = keysToStore.length; i<len; i++) {
			spubSub.store(keysToStore[i]);
		}

		waitsFor(function() {
			return fired === 3;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(3);
		});
	});
	
	it("can unsubscribe with regular expression", function() {
		var keyUnderTest = new RegExp("(t|r|b)est");
		var keysToStore = ["test", "best", "rest"];
		var fired = 0;

		var fn = function(key, msg) {
			fired++;
		};
		
		spubSub.subscribe({
			key : keyUnderTest,
			fn : fn
		});

		for(var i =0, len = keysToStore.length; i<len; i++) {
			spubSub.store(keysToStore[i]);
		}

		waitsFor(function() {
			return fired === 3;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(3);
		});
		
		runs(function() {
			fired = 0;
			spubSub.unsubscribe(keyUnderTest, fn);
			
			for(var i =0, len = keysToStore.length; i<len; i++) {
				spubSub.store(keysToStore[i]);
			}	
		});
		
		runs(function() {
			expect(fired).toEqual(0);
		});
	});
	
	it("can subscribe with regular expression and callback with correct key and order", function() {
		var keyUnderTest = new RegExp("(t|r|b)est");
		var keysToStore = ["test", "best", "rest"];
		var results = [];

		spubSub.subscribe({
			key : keyUnderTest,
			fn : function(key, msg) {
				results.push(key);
			}
		});

		for(var i =0, len = keysToStore.length; i<len; i++) {
			spubSub.store(keysToStore[i]);
		}

		waitsFor(function() {
			return results.length === 3;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(results).toEqual(keysToStore);
		});

	});
	
	it('can store and fetch', function() {
		var keyUnderTest = "key";
		var value = "works";
		
		spubSub.store(keyUnderTest, value);
		var returnedValue = spubSub.fetch(keyUnderTest);
		
		expect(returnedValue).toEqual(value);
	});
	
	it('can delete', function() {
		var keyUnderTest = "key";
		var value = "works";
		
		spubSub.store(keyUnderTest, value);
		var returnedValue = spubSub.fetch(keyUnderTest);
		
		expect(returnedValue).toEqual(value);
		
		spubSub.remove(keyUnderTest);
		returnedValue = spubSub.fetch(keyUnderTest);
		
		expect(returnedValue).toBeUndefined();		
	});
	
	it("can unsubscribe", function() {
		var keyUnderTest = "key";
		var fired = false;
		var fn = function() {
			fired = true;
		};
		
		spubSub.subscribe({
			key : keyUnderTest,
			fn : fn
		});

		spubSub.store(keyUnderTest, true);

		waitsFor(function() {
			return fired;
		}, 'Event listener never fired', 1000);

		runs(function() {
			expect(fired).toEqual(true);
		});
		
		runs(function() {
			fired = false;
			spubSub.unsubscribe(keyUnderTest, fn);
			spubSub.store(keyUnderTest, true);
		});
		
		runs(function() {
			expect(fired).toEqual(false);
		});

	});

});