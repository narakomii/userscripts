// ==UserScript==
// @name        boringscript
// @namespace   narakomii
// @match       http*://diep.io/*
// @match       http*://beta.diep.io/*
// @match       http*://silver-space-halibut-wrp6vj5q64pcg76v-8080.app.github.dev/*
// @run-at      document-start
// @noframes
// @grant       GM.info
// @inject-into page
// @version     0.0.4
// @author      narakomii
// @description narakomii's generic theming and ui toggle keybind script
// ==/UserScript==

// https://localhost:7990/boringscript.user.js

"use strict";
const window = unsafeWindow;

class N {
	static {
		Object.setPrototypeOf(this.prototype, null);
	}
}
class NS {
	static {
		Object.setPrototypeOf(this.prototype, null);
	}

	constructor() {
		throw new TypeError(/* reason */);
	}
}

class V extends NS {
	static {
		Object.freeze(window.console);
	}

	static #bindcall = null;
	static #timeout = null;
	static {
		V.#bindcall = Function.prototype.bind.bind(Function.prototype.call);
		V.#timeout = setTimeout.bind();
	}

	static #ready = false;
	static #extern = null;
	static {
		var descriptor = Object.getOwnPropertyDescriptor(window, "input");
		if (typeof descriptor === "undefined") {
			Object.defineProperty(window, "input", {
				configurable: true,
				enumerable: false,
				set(value) {
					if (value !== null && typeof value === "object") {
						V.#ready = true;
						V.#extern = value;
						delete this["input"];
						return this["input"] = value;
					}
				}
			});
		} else {
			V.#ready = true;
			V.#extern = descriptor.value;
		}
	}

	/*static #canvas = null;
	static {
		new MutationObserver(function(records, observer) {
			for (let record of records) {
				for (let node of record.addedNodes) {
					if (node.id === "canvas" && node.nodeName === "CANVAS") {
						V.#canvas = node;
						observer.disconnect();
					}
				}
			}
		}).observe(document, {
			subtree: true,
			childList: true
		});
	}*/

	static #addkeydown = null;
	static {
		var str = String.bind();
		var keys = new Map();

		// use extra key to decide if keypress should be processed

		document.addEventListener("keydown", function(event) {
			//if (event.repeat || document.activeElement !== V.#canvas) {
			if (event.repeat || document.activeElement !== document.body) {
				return;
			}

			var code = event.code;
			if (!keys.has(code)) {
				return;
			}

			var callbacks = keys.get(code).values();
			for (let cb of callbacks) {
				try {
					(0, cb)();
				} catch (e) {
					//
				}
			}
		}, {
			passive: true
		}, true);

		function addkeydown(code, callback) {
			code = str(code);

			var set;
			if (keys.has(code)) {
				set = keys.get(code);
			} else {
				keys.set(code, set = new Set());
			}

			set.add(callback);
		}

		V.#addkeydown = addkeydown;
	}

	static #settings = null;
	static {
		class q {
			static {
				Object.setPrototypeOf(this.prototype, null);
			}

			static #hexcomp = null;
			static #hex = null;
			static #srgbnlt = null;
			static #oklab = null;
			static #oklch = null;
			static {
				var sin = Math.sin.bind();
				var cos = Math.cos.bind();
				var pi = Math.PI + 0;
				var round = Math.round.bind();
				var tostr = V.#bindcall(Number.prototype.toString);
				var padstart = V.#bindcall(String.prototype.padStart);

				function hexcomp(x) {
					x = round(x);
					return padstart(tostr(x > 0 ? (x < 255 ? x : 255) : 0, 16), 2, "0");
				}

				function hex(r, g, b) {
					return "0x" + hexcomp(r) + hexcomp(g) + hexcomp(b);
				}

				function srgbnlt(x) {
					if (x >= 0.0031308)
						return 1.055 * (x ** 0.4166666666666667) - 0.055;

					return 12.92 * x;
				}

				function oklab(lightness, a, b) {
					var l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
					var m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
					var s = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3;

					return hex(
						255 * srgbnlt(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
						255 * srgbnlt(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
						255 * srgbnlt(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
					)
				}

				function oklch(lightness, chroma, hue) {
					hue = hue * pi / 180;

					return oklab(lightness, chroma * cos(hue), chroma * sin(hue));
				}

				/*- window.__vd_q = q; /* DEBUG */

				q.#hexcomp = hexcomp;
				q.#hex = hex;
				q.#srgbnlt = srgbnlt;
				q.#oklab = oklab;
				q.#oklch = oklch;
			}

			static #seal = null;
			static #match = null;
			static #convert = null;
			static {
				q.#seal = Object.seal.bind();
				q.#match = RegExp.prototype.test.bind(/^[a-z_]+(?: [^ ]+)+$/g);

				var hex = /(?<= )%#([0-9a-fA-F]{6})%/g;
				var oklab = /(?<= )%oklab\(([^ )]+) ([^ )]+) ([^ )]+)\)%/g;
				var oklch = /(?<= )%oklch\(([^ )]+) ([^ )]+) ([^ )]+)\)%/g;

				function replacehex(_, p1) {
					return "0x" + p1;
				}

				function replaceoklab(_, p1, p2, p3) {
					return q.#oklab(parseFloat(p1), parseFloat(p2), parseFloat(p3));
				}

				function replaceoklch(_, p1, p2, p3) {
					return q.#oklch(parseFloat(p1), parseFloat(p2), parseFloat(p3));
				}

				var replaceAll = V.#bindcall(String.prototype.replaceAll);

				q.#convert = function convert(str) {
					return replaceAll(replaceAll(replaceAll(str, hex, replacehex), oklab, replaceoklab), oklch, replaceoklch);
				}
			}

			static #split = null;
			static #trim = null;
			static {
				q.#split = V.#bindcall(String.prototype.split);
				q.#trim = V.#bindcall(String.prototype.trim);
			}

			#onSet = null;
			#values = [];

			constructor(onSet, defaults) {
				if (typeof onSet !== "function") {
					throw new TypeError(/* reason */);
				}

				this.#onSet = onSet;

				q.#seal(this);

				if (typeof defaults === "string") {
					this.values = defaults;
				}
			}

			set values(value) {
				if (typeof value !== "string") {
					throw new TypeError(/* reason */);
				}

				value = q.#split(value, "\n");
				var values = this.#values;
				values.length = 0;
				for (let str of value) {
					if (typeof str === "string" && (str = q.#trim(str)).length > 2) {
						values.push(q.#convert(str));
					}
				}

				this.#onSet(values.slice());
			}
		}

		var values = [];
		var first = true;
		var delay = 25;

		function settings() {
			if (V.#ready) {
				var exec = V.#extern.execute;
				var counter = 0;
				for (let value of values) {
					V.#timeout(() => void exec(value), counter * delay);
					counter++;
				}
			}
		}

		V.#settings = settings;

		var defaults = `\
net_replace_color 0 %oklch(0.6227 0 0)%
net_replace_color 1 %oklch(0.6227 0 0)%
net_replace_color 2 %oklch(0.5662 0.1013 247.28)%
net_replace_color 3 %oklch(0.5662 0.1013 247.28)%
net_replace_color 4 %oklch(0.5662 0.1013 1.59)%
net_replace_color 5 %oklch(0.5662 0.1013 311.38)%
net_replace_color 6 %oklch(0.5662 0.1013 174.64)%
net_replace_color 7 %oklch(0.7433 0.1246 161.84)%
net_replace_color 8 %oklch(0.4618 0.0370 292.15)%
net_replace_color 9 %oklch(0.5788 0.0507 292.15)%
net_replace_color 10 %oklch(0.6958 0.0642 292.15)%
net_replace_color 11 %oklch(0.58 0.0928 292.15)%
net_replace_color 12 %oklch(0.7522 0.1202 96.66)%
net_replace_color 13 %oklch(0.7433 0.1246 161.84)%
net_replace_color 14 %oklch(0.6227 0 0)%
net_replace_color 15 %oklch(0.5662 0.1013 1.59)%
net_replace_color 16 %oklch(0.5662 0.1013 1.59)%
net_replace_color 17 %oklch(0.7522 0 0)%
ui_replace_colors %oklch(0.6365 0.0862 10.15)% %oklch(0.6365 0.0862 354.97)% %oklch(0.6365 0.0862 339.78)% %oklch(0.6365 0.0862 324.6)% %oklch(0.6365 0.0862 309.41)% %oklch(0.6365 0.0862 294.23)% %oklch(0.6365 0.0862 279.04)% %oklch(0.6365 0.0862 263.86)%
ren_grid_base_alpha 0.25
ren_grid_color %oklch(0.7433 0 0)%
ren_background_color %oklch(0.2778 0.0181 292.15)%
ren_stroke_soft_color true
ren_stroke_soft_color_intensity -0.3
ren_minimap_background_color %oklch(0.2778 0.0181 292.15)%
ren_minimap_border_color %oklch(0 0 0)%
ren_bar_background_color %oklch(0 0 0)%
ren_xp_bar_fill_color %oklch(0.7433 0.1246 161.84)%
ren_score_bar_fill_color %oklch(0.7433 0.1246 161.84)%
ren_health_background_color %oklch(0 0 0)%
ren_health_fill_color %oklch(0.7433 0.1246 161.84)%
ren_raw_health_values true
`;

		// ["<console value to toggle>", "<KeyboardEvent.code value of key>", <default true/false value>]
		// you can find the second value using this website: (e.code)
		// https://keyjs.dev/
		var defaulttoggles = [
			["ren_upgrades", "KeyZ", true],
			["ren_achievements", "KeyN", false],
			["ren_scoreboard", "Equal", true],
			["ren_ui", "Minus", true]
		];
		var toggles = new Map();

		for (let toggle of defaulttoggles) {
			let name = toggle[0];
			defaults += `${name} ${toggle[2]}\n`;
			toggles.set(name, toggle[2]);
			V.#addkeydown(toggle[1], function() {
				if (V.#ready) {
					var val = !toggles.get(name);
					toggles.set(name, val);

					V.#extern.execute(name + " " + val);
				}
			});
		}

		window["__vd_console"] = new q(function(newvalues) {
			values = newvalues;

			if (first) {
				first = false;
				return;
			}

			settings();
		}, defaults);
	}

	static #websocket = null;
	static {
		var listen = V.#bindcall(EventTarget.prototype.addEventListener);
		var canSet = true;

		function onOpen(event) {
			if (canSet) {
				canSet = false;
				V.#timeout(V.#settings, 0);
			}
		}

		V.#websocket = function websocket(websocket, url) {
			listen(websocket, "open", onOpen);
		};
	}

	static #matchhost = null;
	static {
		var exec = RegExp.prototype.exec.bind(new RegExp(
			"^(?:((?:[^.\s]+\.)*(?:[^.\s]+))\.)?"
			+ location.hostname.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
			+ "$"
		));

		V.#matchhost = function matchhost(hostname) {
			var match = exec(hostname);
			return match === null ? null : match[1];
		};
	}

	static {
		window.WebSocket = new Proxy(WebSocket, {
			construct(target, args, newTarget) {
				var websocket = Reflect.construct(target, args, target);

				var url = new URL(args[0]);
				var prefix = V.#matchhost(url.hostname);

				if (prefix !== null) {
					V.#websocket(websocket, url);
				}

				return websocket;
			}
		});
	}
}
