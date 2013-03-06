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

});