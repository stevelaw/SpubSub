;
(function(root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	} else {
		// Browser globals (root is window)
		root.SpubSub = factory();
	}
}(this, function() {

	/*
	 * Hash of subscribers by key name.
	 */
	var subs = {};
	
	/*
	 * Message storage.
	 */
	var messages = {};

	/*
	 * Error helper.
	 */
	var throwError = function(message) {
		throw new Error(message);
	};
	
	/**
	 * 
	 * @param options.key The subscription key. This can be an array of values. 
	 * 					(Required)
	 * @param options.fn Called when matched message is stored. (Required)
	 * 
	 * @throws Error if any of the required arguments are not supplied, or of 
	 * 		   the incorrect type. 
	 */
	var subscribe = function(options) {
		/*
		 * Validate method arguments.
		 */
		!options.hasOwnProperty(key) && throwError("options.key is required");
		!options.fn && throwError("options.fn is required");
		(typeof(options.fn) !== "function") && throwError("options.fn is not a function");

		var key = options.key;
		
		/*
		 * Convert key into an array if not already. 
		 */
		if (!(key instanceof Array)) {
			key = [key];
		}
		
		var fn = options.fn;
		
		// We do need to account for the possibility of values being set to 
		// undefined or null, as we control the creation of the values.
		subs[key] = subs[key] || [];
		
		// Push an object for flexibility.
		subs[key].push({ fn: fn });
		
		if(messages.hasOwnProperty(key)) {
			fn(messages[key]);
		}		
	};
	
	var store = function(key, val) {
		
	};
	
	var fetch = function(key) {
		return messages[key];
	};
	
	var remove = function(key) {
		return delete messages[key];
	};

	return {
		subscribe: subscribe,
		store: store,
		fetch: fetch,
		remove: remove
	};
}));