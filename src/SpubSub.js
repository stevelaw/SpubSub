;
/**
 * A pubsub implementation that stores messages prior to publishing to
 * subscribers.
 * 
 * @author Steve Lawson
 */
(function(root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory;
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	} else {
		// Browser globals (root is window)
		root.SpubSub = factory;
	}
}(this,
		function() {

			/*
			 * Hash of subscribers by key/string.
			 */
			var keySubs = {};

			/*
			 * Array of RegEx subscriptions. We need to scan each subscription
			 * to determine a match. Limit the size of these subscriptions, by
			 * unsubscribing when not needed, or use string values when the
			 * possible number of matches is low, is ideal.
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
			 * Executes in setTimeout to allow the caller to not be blocked by
			 * callee.
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
					if (entry.regex.test(key)) {
						executeCallback(entry.fn, key, message);
					}
				}
			};

			/**
			 * Subscribe a function by key or RegExp object, to be called when a
			 * message is stored matching the registered key or RegExp.
			 * 
			 * @param options.key
			 *            The subscription key. This can be an array of values.
			 *            The key can also be a RegEx object. A string will be
			 *            taken literally, and not interpreted as a regular
			 *            expression. (Required)
			 * 
			 * @param options.fn
			 *            Called when matched message is stored. (Required)
			 * 
			 * @throws Error
			 *             If any of the required arguments are not supplied, or
			 *             of the incorrect type.
			 */
			var subscribe = function(options) {
				// Validate method arguments.
				!options.hasOwnProperty("key")
						&& throwError("options.key is required");
				!options.fn && throwError("options.fn is required");
				(typeof (options.fn) !== "function")
						&& throwError("options.fn is not a function");

				var keyArray = options.key;

				// Convert key into an array if not already.
				if (!(keyArray instanceof Array)) {
					keyArray = [ keyArray ];
				}

				var fn = options.fn;

				for ( var i = 0, len = keyArray.length; i < len; i++) {
					var key = keyArray[i];

					if (key instanceof RegExp) {
						regExSubs.push({
							regex : key,
							fn : fn
						});
					} else {
						/*
						 * We do need to account for the possibility of values
						 * being set to undefined or null, as we control the
						 * creation of the values.
						 */
						keySubs[key] = keySubs[key] || [];

						// Push an object for flexibility.
						keySubs[key].push({
							fn : fn
						});
					}
				}
			};

			/**
			 * Unsubscribe an individual or all listeners.
			 * 
			 * @param key
			 *            Key to unsubscribe. If set to "all", then all
			 *            subscribers are removed.
			 * @param listener
			 *            Listener to unsubscribe.
			 */
			var unsubscribe = function(key, fn) {
				if (key === "all") {
					keySubs = {};
					regExSubs = [];

					return true;
				} else {
					if (key instanceof RegExp) {
						for ( var i = 0, len = regExSubs.length; i < len; i++) {
							var regExSub = regExSubs[i];
							var regEx = regExSub.regex;
							var regExFn = regExSub.fn;

							if (regEx === key && fn === regExFn) {
								regExSubs.splice(i, 1);

								return true;
							}
						}
					} else {
						var subs = keySubs[key];

						if (subs !== undefined && subs.length) {
							for ( var i = 0, len = subs.length; i < len; i++) {
								if (fn === subs[i].fn) {
									subs.splice(i, 1);

									return true;
								}
							}
						}
					}

					return false;
				}
			};

			/**
			 * Store a message by key in the SpubSub, and notify any listeners.
			 * 
			 * @param key
			 *            The key the message should be stored as.
			 * @param val
			 *            The message.
			 */
			var store = function(key, val) {
				messages[key] = val;

				if (keySubs.hasOwnProperty(key)) {

					var subs = keySubs[key];

					for ( var i = 0, len = subs.length; i < len; i++) {
						executeCallback(subs[i].fn, key, val);
					}
				}

				testRegExSubs(key, val);
			};

			/**
			 * Returns a message by passed in key name.
			 * 
			 * @param key
			 *            Key name with which to retrieve the message from the
			 *            internal message store. Undefined is returned if the
			 *            message by the key does not exist.
			 */
			var fetch = function(key) {
				return messages[key];
			};

			/**
			 * Deletes a message by passed in key name.
			 * 
			 * @param key
			 *            Key name with which to delete the message from the
			 *            internal message store.
			 */
			var remove = function(key) {
				return delete messages[key];
			};

			return {
				subscribe : subscribe,
				store : store,
				fetch : fetch,
				remove : remove,
				unsubscribe : unsubscribe
			};
		}));