;
/**
 * 
 */
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
	 * Hash of subscribers by key/string.
	 */
	var keySubs = {};

	/*
	 * Array of RegEx subscriptions. We need to scan each subscription to
	 * determine a match. Limit the size of these subscriptions, by
	 * unsubscribing when not needed, or use string values when the possible
	 * number of matches is low, is ideal.
	 */
	var regExSubs = [];

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

	/*
	 * Executes in setTimeout to allow the caller to not be blocked by callee.
	 */
	var executeCallback = function(fn, key, message) {
		setTimeout(function() {
			fn(key, message);
		}, 0);
	};

	/*
	 * Test each RegExp subscription for a match against the key.
	 */
	var testRegExSubs = function(key, message) {
		for ( var i = 0, len = regExSubs.length; i < len; i++) {
			var entry = regExSubs[i];
			if(entry.regex.test(key)) {
				executeCallback(entry.fn, key, message);
			}
		}
	};

	/**
	 * 
	 * @param options.key
	 *            The subscription key. This can be an array of values. The key
	 *            can also be a RegEx object. A string will be taken literally,
	 *            and not interpreted as a regular expression. (Required)
	 * 
	 * @param options.fn
	 *            Called when matched message is stored. (Required)
	 * 
	 * @throws Error
	 *             If any of the required arguments are not supplied, or of the
	 *             incorrect type.
	 */
	var subscribe = function(options) {

		// Validate method arguments.
		!options.hasOwnProperty(key) && throwError("options.key is required");
		!options.fn && throwError("options.fn is required");
		(typeof (options.fn) !== "function")
				&& throwError("options.fn is not a function");

		var keys = options.key;

		// Convert key into an array if not already.
		if (!(keys instanceof Array)) {
			keys = [ key ];
		}

		var fn = options.fn;

		for ( var i = 0, len = keys.length; i < len; i++) {
			var key = keys[i];

			if (key instanceof RegExp) {
				regExSubs.push({
					regex: key,
					fn : fn
				});
			} else {
				// We do need to account for the possibility of values being set
				// to undefined or null, as we control the creation of the
				// values.
				keySubs[key] = keySubs[key] || [];

				// Push an object for flexibility.
				keySubs[key].push({
					fn : fn
				});
			}
		}
	};

	var store = function(key, val) {
		if (keySubs.hasOwnProperty(key)) {
			executeCallback(keySubs[key].fn, key, val);
		}

		testRegExSubs(key, val);
	};

	var fetch = function(key) {
		return messages[key];
	};

	var remove = function(key) {
		return delete messages[key];
	};

	return {
		subscribe : subscribe,
		store : store,
		fetch : fetch,
		remove : remove
	};
}));