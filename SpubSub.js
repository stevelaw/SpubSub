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
	 * 
	 */
	var messages = {};

	var subscribe = function(key, fn) {
		// We do need to account for the possibility of values being set to 
		// undefined or null, as we control the creation of the values.
		subs[key] = subs[key] || [];
		
		// Push an object to support additional features.
		subs[key].push({ fn: fn });
		
		
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