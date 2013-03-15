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
}
		(
				this,
				function(options) {

					/*
					 * Separator character.
					 */
					var topicSeparator = options && options.topicSeparator
							|| "/";

					/*
					 * Hash of subscribers by key/string.
					 */
					var keySubs = {};

					/*
					 * Array of RegEx subscriptions. We need to scan each
					 * subscription to determine a match. Limit the size of
					 * these subscriptions, by unsubscribing when not needed, or
					 * use string values when the possible number of matches is
					 * low.
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
					 * Executes in setTimeout to allow the caller to not be
					 * blocked by callee.
					 */
					var executeCallback = function(entry, key, message) {
						setTimeout(function() {
							entry.fn(key, message);

							if (entry.once) {
								// If entry is a regular expression key, then we
								// need to
								// unsubscribe using the RegExp object, and not
								// the
								// matched key value.
								unsubscribe(entry.regex || key, entry.fn);
							}
						}, 0);
					};

					/*
					 * Test each RegExp subscription for a match against the
					 * key.
					 */
					var testRegExSubs = function(key, message) {
						for ( var i = 0, len = regExSubs.length; i < len; i++) {
							var entry = regExSubs[i];
							if (entry.regex.test(key)) {
								executeCallback(entry, key, message);
							}
						}
					};

					/*
					 * See JSDoc below.
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

						// Guarantee a boolean data-type
						var once = !!options.once;

						var returnHandle = [];

						for ( var i = 0, len = keyArray.length; i < len; i++) {
							var key = keyArray[i];

							if (key instanceof RegExp) {
								regExSubs.push({
									regex : key,
									fn : fn,
									once : once
								});

								returnHandle.push({
									key : key,
									fn : fn
								});
							} else {
								/*
								 * We do need to account for the possibility of
								 * values being set to undefined or null, as we
								 * control the creation of the values.
								 */
								keySubs[key] = keySubs[key] || [];

								// Push an object for flexibility.
								keySubs[key].push({
									fn : fn,
									once : once
								});

								returnHandle.push({
									key : key,
									fn : fn
								});
							}
						}

						return returnHandle;
					};

					/*
					 * See JSDoc below.
					 */
					var unsubscribe = function(handle, fn) {
						var handles = [];
						if (handle instanceof Array) {
							handles = handle;
						} else if ((typeof handle === 'string' || handle instanceof RegExp)
								&& (typeof (fn) === "function")) {
							handles.push({
								key : handle,
								fn : fn
							});
						} else {
							throwError("Unsupported arguments passed to unsubscribe");
						}

						var numUnsubscribed = 0, nHandles = handles.length;

						var i, len;
						while (nHandles--) {
							var cHandle = handles[nHandles];
							var key = cHandle.key;
							var cFn = cHandle.fn;

							if (key instanceof RegExp) {
								for (i = 0, len = regExSubs.length; i < len; i++) {
									var regExSub = regExSubs[i];
									var regEx = regExSub.regex;
									var regExFn = regExSub.fn;

									if (regEx === key && cFn === regExFn) {
										regExSubs.splice(i, 1);
										numUnsubscribed++;
										break;
									}
								}
							} else {
								var subs = keySubs[key];

								if (subs !== undefined && subs.length) {
									for (i = 0, len = subs.length; i < len; i++) {
										if (cFn === subs[i].fn) {
											subs.splice(i, 1);

											numUnsubscribed++;
										}
									}
								}
							}
						}

						return numUnsubscribed;
					};

					/*
					 * Helper function to compare arrays using simple equality
					 * test.
					 */
					var compareArrays = function(array1, array2) {
						if (array1.length != array2.length) {
							return false;
						}

						for ( var i = 0; i < array1.length; i++) {
							if (array1[i] !== array2[i]) {
								return false;
							}
						}

						return true;
					};

					/*
					 * See JSDoc below.
					 */
					var store = function(key, val, noStore) {
						if (!noStore) {
							messages[key] = val;
						}

						var executeHelper = function(subs) {
							for ( var i = 0, len = subs.length; i < len; i++) {
								executeCallback(subs[i], key, val);
							}
						};

						// Check for wild card at the end of the key.
						if (/\*$/.test(key)) {
							var matchParts = key.split(topicSeparator);

							// Remove wild card
							matchParts = matchParts.slice(0,
									matchParts.length - 1);

							console.log(matchParts);

							// Loop through all subscriber keys.
							for ( var curKey in keySubs) {
								// Does key contain a topic separator?
								if (curKey.indexOf(topicSeparator) !== -1) {
									var keyParts = curKey.split(topicSeparator)
											.slice(0, matchParts.length);

									console.log(keyParts);

									compareArrays(matchParts, keyParts)
											&& executeHelper(keySubs[curKey]);
								}
							}
						} else {
							executeHelper(keySubs[key] || []);
							testRegExSubs(key, val);
						}
					};

					/*
					 * See JSDoc below.
					 */
					var fetch = function(key) {
						return messages[key];
					};

					/*
					 * See JSDoc below.
					 */
					var remove = function(key) {
						return delete messages[key];
					};

					/*
					 * See JSDoc below.
					 */
					var removeAll = function() {
						messages = {};
					};

					/*
					 * Public API
					 */
					return {
						/**
						 * Subscribe a function by key or RegExp object, to be
						 * called when a message is stored matching the
						 * registered key or RegExp.
						 * 
						 * @param options.key
						 *            The subscription key. This can be an array
						 *            of values. The key can also be a RegEx
						 *            object. A string will be taken literally,
						 *            and not interpreted as a regular
						 *            expression. (Required)
						 * 
						 * @param options.fn
						 *            Called when matched message is stored.
						 *            (Required)
						 * 
						 * @param options.once
						 *            Set to true when the subscriber should be
						 *            removed after first notification.
						 * 
						 * @throws Error
						 *             If any of the required arguments are not
						 *             supplied, or of the incorrect type.
						 */
						subscribe : subscribe,

						/**
						 * Store a message by key in the SpubSub, and notify any
						 * listeners.
						 * 
						 * @param key
						 *            The key the message should be stored as.
						 * @param val
						 *            The message.
						 * 
						 * @param noStore
						 *            Set to true to skip message storage.
						 */
						store : store,

						/**
						 * Returns a message by passed in key name.
						 * 
						 * @param key
						 *            Key name with which to retrieve the
						 *            message from the internal message store.
						 *            Undefined is returned if the message by
						 *            the key does not exist.
						 */
						fetch : fetch,

						/**
						 * Deletes a message by passed in key name.
						 * 
						 * @param key
						 *            Key name with which to delete the message
						 *            from the internal message store.
						 */
						remove : remove,

						/**
						 * Unsubscribe an individual or all listeners.
						 * 
						 * @param key
						 *            Key to unsubscribe. If set to "all", then
						 *            all subscribers are removed.
						 * @param listener
						 *            Listener to unsubscribe.
						 * 
						 * @return Number of subscribers that were unsubscribed.
						 */
						unsubscribe : unsubscribe,

						/**
						 * Removes all messages from the internal message store.
						 */
						removeAll : removeAll
					};
				}));