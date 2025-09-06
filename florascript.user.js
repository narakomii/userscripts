// ==UserScript==
// @name        florascript
// @namespace   narakomii
// @match       http*://florr.io/*
// @run-at      document-start
// @noframes
// @grant       GM.info
// @inject-into page
// @version     0.0.1
// @author      narakomii
// @description florr.io keyboard layout fixer
// ==/UserScript==

"use strict";

const window = unsafeWindow;

const apply = Function.prototype.call.bind(Function.prototype.apply);

const map = new Map([
	["KeyA", 65],
	["KeyB", 66],
	["KeyC", 67],
	["KeyD", 68],
	["KeyE", 69],
	["KeyF", 70],
	["KeyG", 71],
	["KeyH", 72],
	["KeyI", 73],
	["KeyJ", 74],
	["KeyK", 75],
	["KeyL", 76],
	["KeyM", 77],
	["KeyN", 78],
	["KeyO", 79],
	["KeyP", 80],
	["KeyQ", 81],
	["KeyR", 82],
	["KeyS", 83],
	["KeyT", 84],
	["KeyU", 85],
	["KeyV", 86],
	["KeyW", 87],
	["KeyX", 88],
	["KeyY", 89],
	["KeyZ", 90],
	["Semicolon", 186],
]);

function key(code, keycode) {
	if (map.has(code)) return map.get(code);

	return keycode;
}

const def = Object.defineProperty;

window.addEventListener = new Proxy(window.addEventListener, {
	apply(target, thisArg, args) {
		if (args[0].startsWith("key")) {
			var fn = args[1];

			args[1] = e => {
				def(e, "keyCode", {value: key(e.code, e.keyCode)});
				return fn(e);
			};

			return apply(target, thisArg, args);
		}

		return apply(target, thisArg, args);
	}
});