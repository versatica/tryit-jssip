!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.antiglobal=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
 * Expose the antiglobal function.
 */
module.exports = antiglobal;


/**
 * Local variables.
 */
var lastGlobals = getGlobals();
var doLog = true;
var doThrow = false;


function antiglobal() {
	var givenDiff = Array.prototype.slice.call(arguments),
		realDiff = [],
		ret = false,
		globals, i, len, elem, msg;

	// Get current globals;
	globals = getGlobals();

	// Create current diff.
	for (i=0, len=globals.length; i<len; i++) {
		elem = globals[i];

		if (lastGlobals.indexOf(elem) === -1) {
			realDiff.push(elem);
		}
	}

	// Compare diffs.
	if (givenDiff.length === realDiff.length) {
		ret = true;

		for (i=0, len=givenDiff.length; i<len; i++) {
			elem = givenDiff[i];

			if (realDiff.indexOf(elem) === -1) {
				ret = false;
				break;
			}
		}
	}

	// Update lastGlobals.
	lastGlobals = globals;

	if (!ret) {
		msg = 'antiglobal() | ERROR: given globals do not match real new globals [given: ' + givenDiff + ' | real: ' + realDiff + ']';
		if (doLog)   { console.error(msg);   }
		if (doThrow) { throw new Error(msg); }
	}

	return ret;
}


/**
 * Reset current globals.
 */
antiglobal.reset = function() {
	lastGlobals = getGlobals();
};


/**
 * Public properties.
 */
Object.defineProperties(antiglobal, {
	log: {
		get: function() { return doLog; },
		set: function(bool) { doLog = Boolean(bool); }
	},

	throw: {
		get: function() { return doThrow; },
		set: function(bool) { doThrow = Boolean(bool); }
	}
});


/**
 * Private API.
 */


function getGlobals() {
	var globals = [];

	for (var key in global) {
		if (global.hasOwnProperty(key)) {
			// Ignore this module.
			if (key !== 'antiglobal') {
				globals.push(key);
			}
		}
	}

	return globals;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});