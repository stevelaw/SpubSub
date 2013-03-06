describe("SpubSub", function() {
	var spubSub = null;

	beforeEach(function() {
		spubSub = SpubSub();
	});

	it("spubSub should not be null", function() {
		expect(spubSub).not.toBeNull();
	});
	
	it("spubSub should be defined", function() {
		expect(spubSub).toBeDefined();
	});

	it("spubSub subscription should work", function() {
		var keyUnderTest = "testEvent";
		var fired = false;
		
		spubSub.subscribe({
			key: keyUnderTest,
			fn: function(key, msg) {
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
	
});