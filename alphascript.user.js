// ==UserScript==
// @name        alphascript
// @namespace   narakomii
// @match       http*://beta.diep.io/*
// @run-at      document-start
// @noframes
// @grant       GM.info
// @inject-into page
// @version     0.0.1
// @author      narakomii
// @description beta.diep.io theme file picker and "input" object exposer ("theme" button in the bottom left)
// ==/UserScript==

"use strict";

document.open();

const window = unsafeWindow;

const id = crypto.randomUUID();

var setTheme;

window[id] = (() => {
	var hasrun = false;

	return function(hd, gd) {
		if (hasrun) return;
		hasrun = true;
		delete window[id];

		window["input"] = hd;

		setTheme = gd.setTheme;

		// setTheme(JSON.parse(themetext).values);
	};
})();

var regPath = /^.*\//,
	regSource = /^index(-[0-9a-f]+\.)?js$/i;

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

		makebutton();
	});
});

function edit(js) {
	return js + `\nwindow["${id}"](hd, gd);`;
}

function makebutton() {
	var input = document.createElement("input");
	input.type = "file";
	input.accept = ".json";
	input.addEventListener("change", e => {
		var reader = new FileReader();

		reader.addEventListener("load", e => {
			setTheme(JSON.parse(e.target.result).values);
		});

		reader.readAsText(e.target.files[0], "UTF-8");
	});

	var style = new CSSStyleSheet();

	style.replaceSync(`\
#alphabutton {
	all: unset;
	position: fixed;
	border: 2px solid white;
	border-radius: 4px;
	opacity: 0.33333;
	padding: 2px;
	bottom: 10px;
	left: 10px;
	z-index: 100;
	cursor: pointer;
}

#alphabutton:hover {
	opacity: 0.66667;
}
`);

	document.adoptedStyleSheets.push(style);

	var button = document.createElement("button");
	button.id = "alphabutton";
	button.textContent = "theme";
	button.addEventListener("click", () => void input.click());

	document.body.appendChild(button);
}
