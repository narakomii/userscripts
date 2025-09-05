// ==UserScript==
// @name        thetascript
// @namespace   narakomii
// @match       http*://silver-space-halibut-wrp6vj5q64pcg76v-8080.app.github.dev/*
// @run-at      document-start
// @noframes
// @grant       GM.info
// @inject-into page
// @version     0.0.1
// @author      narakomii
// @description diepcustom keyboard layout fixer
// ==/UserScript==

"use strict";

document.open();

const window = unsafeWindow;

const id = crypto.randomUUID();

window[id] = (() => {
	var hasrun = false;

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

	return function() {
		if (hasrun) return;
		hasrun = true;
		delete window[id];

		return function(code, keycode) {
			if (map.has(code)) return map.get(code);

			return keycode;
		};
	};
})();

const regPath = /^.*\//,
	regSource = /^input\.js$/i;

fetch(window.location)
.then((response) => response.text())
.then((originalHTML) => {
	var newDocument = new DOMParser().parseFromString(originalHTML, "text/html"),
		targetURL,
		targetElement = Array.from(newDocument.getElementsByTagName("script")).find((element) => {
			var source = new URL(element.getAttribute("src"), location);
			if (source.origin === location.origin && regSource.test(source.pathname.replace(regPath, ""))) {
				targetURL = source;
				return true;
			} else {
				return false;
			}
		});

	fetch(targetURL)
	.then((response) => response.text())
	.then((originalJS) => {
		targetElement.setAttribute("src", URL.createObjectURL(new Blob(
			[edit(originalJS)],
			{
				type: "text/javascript"
			}
		)))

		document.write(new XMLSerializer().serializeToString(newDocument.doctype) + newDocument.documentElement.outerHTML);
		document.close();
	});
});

function edit(js) {
	return js.replace("window.input.keyDown(e.keyCode);", "window.input.keyDown(k(e.code, e.keyCode))")
	.replace("window.input.keyUp(e.keyCode);", "window.input.keyUp(k(e.code, e.keyCode))")
	.replace("window.setupInput = () => {", `window.setupInput = () => {
	const k = window["${id}"]();
`);
}
