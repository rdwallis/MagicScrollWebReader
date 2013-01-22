"use strict";

var _write = document.write;
document.write = function(t) {
	// prevent external scripts from writing to dom
}

var staticscroll = {
	prepPage: null,
	pages: [0],
	processPagesTimerId: 0,
	article: null,
	goalPage: 0,
	currentPage: 0,
	lastPage: -1,
	topPage: null,
	bottomPage: null,
	scrollInfo: [],
	progressIndicator: null,
	topRightHider: null,
	scrollSpeed: 25,
	playButton: null,
	scroll_speed_display:null,
	hotKeyDialog: null,
	innerHotKeyDialog: null,
	settingsDialog: null,
	innerSettingsDialog: null,
	bugReportDiv: null,
	bugReportMetaInput: null,
	bugReportButton: null,
	bugReportCloseButton: null,
	hotKeysEnabled: true,
	magicMouse: false,
	fontSize: 1,
	colorScheme: 0,
	rtl: false,

	
	
	init: function() {
		if (typeof(window.stop) != "undefined") {
			window.stop();
		}
		window.scrollTo(0,0);
		staticscroll.nextWordLocalVar.prevIndex = 0;
		staticscroll.loadScrollSpeed();
		if (readability.error) {
			staticscroll.showCenteredBugReport();
			return;
		}
		if (!staticscroll.article) {
			
			staticscroll.article = readability.article.replace(/align=('|")(left|right)('|")/gi, "").replace(/></g, "> <");
			document.body.className = "ss_body ss_body_cs_" + staticscroll.colorScheme;
			if (staticscroll.colorScheme == 0) {
				document.body.style.backgroundImage = "url(" + ss_url("images/skewed_print.png") + ")";
			} else {
				document.body.style.backgroundImage = "none";
			}
			if (staticscroll.article.search(/dir=['\"]rtl['\"]/img) != -1) {
				staticscroll.rtl = true;
			}

		}
		
		


		/* Clear the old HTML, insert the new content. */
		document.body.innerHTML = "";
		document.body.style.height = window.innerHeight + "px!important";

		/* Initialize pages */
		if (!staticscroll.topPage) {
			staticscroll.topPage = document.createElement("DIV");
			staticscroll.topPage.id = "ss_topPage";
			staticscroll.topPage.className = "ss_page fs_" + staticscroll.fontSize + " cs_" + staticscroll.colorScheme;
			// staticscroll.topPage.style.backgroundImage = bground;
			
		}

		if (!staticscroll.bottomPage) {
			staticscroll.bottomPage = document.createElement("DIV");
			staticscroll.bottomPage.id = "ss_bottomPage";
			staticscroll.bottomPage.className = "ss_page fs_" + staticscroll.fontSize + " cs_" + staticscroll.colorScheme;
			staticscroll.bottomPage.innerHTML = staticscroll.article;
						// staticscroll.bottomPage.style.backgroundImage =
						// bground;

			
		}

		if (!staticscroll.prepPage) {
			staticscroll.prepPage = document.createElement("DIV");
			staticscroll.prepPage.id = "ss_prepPage";
			staticscroll.prepPage.className = "ss_page fs_" + staticscroll.fontSize + " cs_" + staticscroll.colorScheme;
			
		}

		var width = Math.round(Math.min(window.innerWidth - 60, Math.max(window.innerHeight * 0.618, 400) + 20));

		staticscroll.topPage.style.width = width + "px";
		staticscroll.bottomPage.style.width = width + "px";
		staticscroll.bottomPage.style.height = (staticscroll.getMaxHeight() + 50)+ "px";
		staticscroll.prepPage.style.width = width + "px";

		var left = (((window.innerWidth - width) / 2) - 30);

		staticscroll.topPage.style.left = left + "px";
		staticscroll.bottomPage.style.left = left  + "px";
		staticscroll.prepPage.style.left = left + "px";

		document.body.appendChild(staticscroll.topPage);
		document.body.appendChild(staticscroll.bottomPage);
		document.body.appendChild(staticscroll.prepPage);



		staticscroll.progressIndicator = document.createElement("DIV");
		staticscroll.progressIndicator.className = "ss_progress_indicator";
		staticscroll.progressIndicator.innerHTML = "0%";
		staticscroll.progressIndicator.style.width = staticscroll.topPage.clientWidth + "px";
		staticscroll.progressIndicator.style.left = staticscroll.topPage.style.left;
		document.body.appendChild(staticscroll.progressIndicator);

		var topHider = document.createElement("DIV");
		topHider.style.top = "0px";
		topHider.style.left= (left) + "px";
		topHider.style.width = (width + 60) + "px";
		topHider.style.height = "31px";
		topHider.className = "ss_top_hider";
		// topHider.style.backgroundImage = bground;
		document.body.appendChild(topHider);


		var rightHider = document.createElement("DIV");
		rightHider.style.top = "0px";
		rightHider.style.left= (left + width + 30) + "px";
		rightHider.style.width = "60px";
		rightHider.className = "ss_right_hider";
		// rightHider.style.backgroundImage = bground;
		document.body.appendChild(rightHider);

		var leftHider = document.createElement("DIV");
		leftHider.style.top = "0px";
		leftHider.style.left= (left - 30) + "px";
		leftHider.style.width = "60px";
		leftHider.className = "ss_right_hider";
		document.body.appendChild(leftHider);

		var bottomHider = document.createElement("DIV");
		bottomHider.style.top = (staticscroll.getMaxHeight() + 30) + "px";
		bottomHider.style.left= (left) + "px";
		bottomHider.style.width = (width + 60) + "px";
		bottomHider.style.height = "50px";
		bottomHider.className = "ss_top_hider";
		// rightHider.style.backgroundImage = bground;
		document.body.appendChild(bottomHider);

		staticscroll.topHider = topHider;
		staticscroll.rightHider = rightHider;
		staticscroll.leftHider = leftHider;
		staticscroll.bottomHider = bottomHider;

		staticscroll.topRightHider = document.createElement("DIV");
		staticscroll.topRightHider.style.top = "30px";
		staticscroll.topRightHider.style.left= (left + width + 30) + "px";
		staticscroll.topRightHider.style.width = "60px";
		staticscroll.topRightHider.className = "ss_top_hider";
		// staticscroll.topRightHider.style.backgroundImage = bground;
		document.body.appendChild(staticscroll.topRightHider);	


		var hotkeyPrompt = document.createElement("DIV");
		hotkeyPrompt.innerHTML = "Press [H] to view [H]otkeys";
		hotkeyPrompt.className = "ss_hotkey_prompt";
		hotkeyPrompt.onclick = function (event) {
			staticscroll.showHideHotKeyDialog();
		};
		document.body.appendChild(hotkeyPrompt);		

		/*
		staticscroll.debugLabel = document.createElement("DIV");
		staticscroll.debugLabel.innerHTML = "DEBUGGING";
		staticscroll.debugLabel.className = "ss_debug_label";
		document.body.appendChild(staticscroll.debugLabel);		
		*/
		
		staticscroll.processPages();

		staticscroll.createUI();
	},

	registerHotKeys: function() {
		log("Registering HotKeys", 2);
		document.onkeydown = function (event) {
			if (staticscroll.hotKeysEnabled) {
				var arrow = {pageDown: 34, pageUp: 33, left: 37, up: 38, right: 39, down: 40, plus: 107, minus: 109, space: 32, h: 72 };
				if ((event.ctrlKey) || (event.altKey) || (event.metaKey)) {
					return true;
				}
				switch(event.keyCode) {
					case arrow.pageUp:
					case arrow.left: 
						staticscroll.showPrevPage();
					break;
					case arrow.space:
	                    			staticscroll.startStopScroll();
			                break;
	                		case arrow.pageDown:
					case arrow.right:
						staticscroll.showNextPage();
					break;
					case arrow.up:
						staticscroll.scrollBackward();
					break;
					case arrow.down:
						staticscroll.scrollForward();
					break;
					case arrow.plus:
						staticscroll.increaseScrollSpeed();
					break;
					case arrow.minus:
						staticscroll.decreaseScrollSpeed();
					break;
					case arrow.h:
						staticscroll.showHideHotKeyDialog();
					break
					case 27:
						if ((staticscroll.hotKeyDialog) && (staticscroll.hotKeyDialog.style.visibility === "visible")) {
							staticscroll.showHideHotKeyDialog();
						}	
					break
					default:
					return true;
				}
			} else {
				if (event.keyCode === 27) {
					staticscroll.showBugReport();
					
				} else {
					return true;
				}
			}
	        return false;

		};
		var mouseScroll = function(event) {
			var delta = 0;
			log("Scroll detected", 2); 
		    if (!event) event = window.event;
		 
		    // normalize the delta
		    if (event.wheelDelta) {
		 
		    	if ((!staticscroll.magicMouse) && (Math.abs(event.wheelDelta) >= 60)) {
		        	delta = event.wheelDelta / 120;	
		        } else {
		        	//log("MagicMouse", 0);
		        	staticscroll.magicMouse = true;
		        	delta = -event.wheelDelta;
		        	
		        }
		        
		 
		    } else if (event.detail) {
		 
		        // W3C
		        delta = -event.detail;
		    }
		    log("Delta: " + delta, 2);
		    var count = 0;
		    if (staticscroll.magicMouse) {
		    	staticscroll.scroll(delta);
		    } else if (delta < 0) {
		    	while (count-- > delta) {
		    		staticscroll.scrollForward();
		    	};

		    } else {
		    	while (count++ < delta) {
		    		staticscroll.scrollBackward();
		    	};
		    	
		    }

		}
		window.onmousewheel = mouseScroll;
		document.documentElement.addEventListener("DOMMouseScroll", mouseScroll, false);
        

		// TOUCH CONTROLS (see README.md for design overview)
		(function(){

			//////////////////////////////////////////////////////////////////////
			// Scroll Metaphor functions
			var hToY = function(h) {
				return h + getTopPageOffset();
			};
			var yToH = function(y) {
				var h = y - getTopPageOffset();
				h = Math.max(0,h);
				h = Math.min(h,getTopPageMaxHeight());
				return h;
			};
			var getMinScroll = function() {
				return hToY(0);
			};
			var getMaxScroll = function() {
				return hToY(getTopPageMaxHeight());
			};
			var getScrollPos = function() {
				return hToY(getTopPageHeight());
			};
			var setScrollPos = function(y) {
				setTopPageHeight(yToH(y));
			};
			var scrollTop = function() {
				setScrollPos(0);
			};
			var scrollBot = function() {
				setScrollPos(getMaxScroll());
			};
			var getScrollState = function() {
				var h = getTopPageHeight();
				if (h == 0) {
					return "TOP";
				}
				else if (h == getTopPageMaxHeight()) {
					return "BOT";
				}
				return "MID";
			};

			//////////////////////////////////////////////////////////////////////
			// Top Page Wrappers
			var getTopPageOffset = function() {
				return staticscroll.topPage.offsetTop;
			};
			var getTopPageHeight = function() {
				return staticscroll.topPage.clientHeight;
			};
			var setTopPageHeight = function(h) {
				staticscroll.topPage.style.height = h + "px";
				staticscroll.topRightHider.style.height = h + "px";
			};
			var getTopPageMaxHeight = function() {
				return staticscroll.getMaxHeight();
			};
			var pageForward = function() {
				staticscroll.showNextPage();
			};
			var pageBack = function() {
				staticscroll.showPrevPage();
			};

			//////////////////////////////////////////////////////////////////////
			// The radius regions for snapping and grabbing.
			var radius = 60;
			var inTopRadius = function(x,y) {
				return Math.abs(y - getMinScroll()) < radius;
			};
			var inBotRadius = function(x,y) {
				return Math.abs(y - getMaxScroll()) < radius;
			};
			var inMidRadius = function(x,y) {
				return Math.abs(y - getScrollPos()) < radius;
			};

			//////////////////////////////////////////////////////////////////////
			// Scroll Anchor
			// (An anchor connects our touch motion to the horizontal scroll guide)
			var anchor = (function() {

				var on = false;
				var offset = 0; // distance between touch and scroll

				// enable anchor exactly at Y
				var set = function(y) {
					offset = 0;
					on = true;
				};
				// enable anchor relative to Y
				var setWithOffset = function(y) {
					offset = y - getScrollPos();
					on = true;
				};

				// A predicate allows us to defer anchoring to another moment.
				var predicate = null; // boolean function
				var predSet = null;   // which "set" function to use when predicate is met.
				var setWhen = function(p) {
					predicate = p;
					predSet = set;
				};
				var setWithOffsetWhen = function(p) {
					predicate = p;
					predSet = setWithOffset;
				};

				// disable anchor
				var clear = function() {
					on = false;
					predicate = null;
				};

				// Update the anchor position if enabled.
				var scroll = function(y) {

					// Enable if predicate is met.
					if (predicate && predicate(y)) {
						predSet(y);
						predicate = null;
						predSet = null;
					}

					// Update scroll position if enabled.
					if (on) {
						setScrollPos(y - offset);
					}
				};

				return {
					set: set,
					setWithOffset: setWithOffset,
					setWhen: setWhen,
					setWithOffsetWhen: setWithOffsetWhen,
					clear: clear,
					scroll: scroll,
					isOn: function() { return on },
				};
			})();

			//////////////////////////////////////////////////////////////////////
			// High level touch functions
			var touchStart = function(x,y) {
				var state = getScrollState();
				var scrollY = getScrollPos();
				if (state == "TOP") {
					if (inTopRadius(x,y)) {
						anchor.set(y);
					}
					else if (inBotRadius(x,y)) {
						anchor.set(y);
						pageBack();
					}
				}
				else if (state == "BOT") {
					if (inTopRadius(x,y)) {
						anchor.set(y);
						pageForward();
					}
					else if (inBotRadius(x,y)) {
						anchor.set(y);
					}
				}
				else if (state == "MID") {
					anchor.setWithOffsetWhen(function(y) {
						return inMidRadius(0,y);
					});
				}
				anchor.scroll(y);
			};
			var touchMove = function(x,y) {
				anchor.scroll(y);
			};
			var touchEnd = function(x,y) {
				if (anchor.isOn()) {
					if (inTopRadius(x,y)) {
						scrollTop();
					}
					else if (inBotRadius(x,y)) {
						scrollBot();
					}
				}
				anchor.clear();
			};
			var touchCancel = function(x,y) {
				touchEnd(x,y);
			};

			//////////////////////////////////////////////////////////////////////
			// Low level touch functions
			// (maps our functions to the proper mouse and touch events)
			(function(){
				var lastX, lastY;
				var callWithXY = function(func,evt) {
					var x,y;
					if (evt.touches && evt.touches.length > 0) { // touch
						x = evt.touches[0].pageX;
						y = evt.touches[0].pageY;
						// disable default touch controls to prevent
						// content-dragging, etc.
						evt.preventDefault();
					}
					else { // mouse
						x = evt.pageX;
						y = evt.pageY;
					}
					lastX = x;
					lastY = y;
					func(x,y);

				};
				var isTouching = false;
				var start = function(evt) {
					isTouching = true;
					callWithXY(touchStart,evt);
				};
				var move = function(evt) {
					if (isTouching) {
						callWithXY(touchMove,evt);
					}
				};
				var end = function(evt) {
					isTouching = false;
					touchEnd(lastX,lastY);
				};
				var cancel = function(evt) {
					isTouching = false;
					touchEnd(lastX,lastY);
				};

                // Only allow mouse touch events when shift key is pressed.
                var mouseCanDrag = false;
                document.addEventListener("keydown", function(evt) {
                    evt = evt || window.event;
                    if (evt.keyCode == 16) {
                        mouseCanDrag = true;
                        setCursor("n-resize");
                    }
                });
                document.addEventListener("keyup", function(evt) {
                    evt = evt || window.event;
                    if (evt.keyCode == 16) {
                        mouseCanDrag = false;
                        setCursor("auto");
                    }
                });
                var wrapMouseCallback = function(callback) {
                    return function(evt) {
                        if (mouseCanDrag) {
                            // only call event if we're allowing the mouse to drag.
                            callback(evt);
                            // prevent text-selecting.
                            evt.preventDefault();
                        }
                        else if (isTouching) {
                            // end our touch operation if needed.
                            end(evt);
                        }
                    };
                };

				// Add touch controls to the elements comprising the page.
				var touchElements = [
					"topPage", "bottomPage",
					"topRightHider",
					"topHider", "bottomHider", "leftHider", "rightHider",
					"progressIndicator"];
				var i,len,elm;
				for (i=0, len=touchElements.length; i<len; i++) {
					elm = staticscroll[touchElements[i]];
					elm.addEventListener('touchstart',	start);
					elm.addEventListener('touchmove',	move);
					elm.addEventListener('touchend',	end);
					elm.addEventListener('touchcancel',	cancel);

                    // emulate touch controls with mouse
                    elm.addEventListener('mousedown',	wrapMouseCallback(start));
                    elm.addEventListener('mousemove',	wrapMouseCallback(move));
                    elm.addEventListener('mouseup',		wrapMouseCallback(end));
				}

                // Set the cursor over the page contents.
                var setCursor = function(c) {
                    var i,len,elm;
                    for (i=0, len=touchElements.length; i<len; i++) {
                        elm = staticscroll[touchElements[i]];
                        elm.style.cursor = c;
                    }
                };

			})();
		})();

        window.onresize = function (event) {
        	staticscroll.doResize();
        }
	},

	showHideHotKeyDialog: function() {
		if (!staticscroll.hotKeyDialog) {
			log("Creating hotkey dialog", 2);
			staticscroll.hotKeyDialog = document.createElement("div");
			staticscroll.innerHotKeyDialog = document.createElement("p");
			staticscroll.hotKeyDialog.className = "ss_hotkey_container";
			staticscroll.innerHotKeyDialog.className = "ss_hotkey_dialog";
			staticscroll.hotKeyDialog.style.visibility = "hidden";
			staticscroll.innerHotKeyDialog.innerHTML = "<table cellspacing='20'>"
			+ "<tr><td align='right' width='240px'><b>[SPACE]</b></td><td>Start or Stop AutoScroll</td></tr>"
			+ "<tr><td align='right' width='240px'><b>[+]/[-]</b></td><td>Increase / Decrease Scroll Speed</td></tr>"
			+ "<tr><td align='right' width='240px'><b>[LEFT]/[PAGE UP]</b></td><td>Previous Page</td></tr>"
			+ "<tr><td align='right' width='240px'><b>[RIGHT]/[PAGE DOWN]</b></td><td>Next Page</td></tr>"
			+ "<tr><td align='right' width='240px'><b>[SHIFT+DRAG]</b></td><td>Move Scroll Line</td></tr>"
			+ "<tr><td align='right' width='240px'><b>[H]</b></td><td>Show or Hide this Dialog</td></tr>"
			+ "</table>";
			staticscroll.innerHotKeyDialog.style.marginTop = (((window.innerHeight - 220) / 2) - 50) + "px";
			staticscroll.innerHotKeyDialog.style.marginLeft = (((window.innerWidth - 580) / 2) - 15) + "px";

			staticscroll.hotKeyDialog.onclick = function (event) {
				staticscroll.showHideHotKeyDialog();
			};

			document.body.appendChild(staticscroll.hotKeyDialog);
			document.body.appendChild(staticscroll.innerHotKeyDialog);
		}
		if (staticscroll.hotKeyDialog.style.visibility === "hidden") {
			staticscroll.hotKeyDialog.style.visibility = "visible";
			staticscroll.innerHotKeyDialog.style.visibility = "visible";
		} else {
			staticscroll.hotKeyDialog.style.visibility = "hidden";
			staticscroll.innerHotKeyDialog.style.visibility = "hidden";
		}
	},
	
	showHideSettingsDialog: function() {
		log("Showing Settings Dialog", 2);
		if (!staticscroll.settingsDialog) {
			log("Creating settings dialog", 2);
			staticscroll.settingsDialog = document.createElement("div");
			staticscroll.innerSettingsDialog = document.createElement("p");
			staticscroll.settingsDialog.className = "ss_settings_container";
			staticscroll.innerSettingsDialog.className = "ss_settings_dialog";
			staticscroll.settingsDialog.style.visibility = "hidden";
			staticscroll.innerSettingsDialog.innerHTML = "<h2>Change Settings: </h2><table cellspacing='10'>"
			+ "<tr><td><table class='ss_radioSettings'><tr><th colspan='2'>Font Size:</th></tr>" 
			+ "<tr><td>Small</td><td><input type='radio' name='fontSize' value='small' id='fs_small'></td></tr>"
			+ "<tr><td>Default</td><td><input type='radio' name='fontSize' value='default' id='fs_default'></td></tr>"
			+ "<tr><td>Large</td><td><input type='radio' name='fontSize' value='large' id='fs_large'></td></tr>"
			+ "<tr><td>Largest</td><td><input type='radio' name='fontSize' value='largest' id='fs_largest'></td></tr>"
			+ "</table></td><td><table class='ss_radioSettings'><tr><th colspan='2'>Color Scheme:</th></tr>"
			+ "<tr><td>Default</td><td><input type='radio' name='colorScheme' value='default' id='cs_default'></td></tr>"
			+ "<tr><td>Solar Day</td><td><input type='radio' name='colorScheme' value='Solar Day' id='cs_solar_day'></td></tr>"
			+ "<tr><td>Solar Night</td><td><input type='radio' name='colorScheme' value='Solar Night' id='cs_solar_night'></td></tr>"
			+ "<tr><td>Low Contrast</td><td><input type='radio' name='colorScheme' value='Low Contrast' id='cs_low_contrast'></td></tr>"
			+ "</table></td></table>"
			+ "<input type='button' value='Save Settings' class='ss_settingsSave' id='ss_saveSettings'/><input type='button' value='Cancel' id='ss_cancelSettings'/>";
			staticscroll.innerSettingsDialog.style.marginTop = (((window.innerHeight - 288) / 2) - 50) + "px";
			staticscroll.innerSettingsDialog.style.marginLeft = (((window.innerWidth - 464) / 2) - 15) + "px";


			staticscroll.settingsDialog.onclick = function (event) {
				staticscroll.showHideSettingsDialog();
			};

			document.body.appendChild(staticscroll.settingsDialog);
			document.body.appendChild(staticscroll.innerSettingsDialog);

			document.getElementById("ss_cancelSettings").onclick = function() {
				staticscroll.showHideSettingsDialog();
			}

			document.getElementById("ss_saveSettings").onclick = function() {
				staticscroll.saveSettings();
			}

			
			switch (staticscroll.fontSize) {
				case 0: document.getElementById('fs_small').checked = true; break;
				case 1: document.getElementById('fs_default').checked = true; break;
				case 2: document.getElementById('fs_large').checked = true; break;
				case 3: document.getElementById('fs_largest').checked = true; break;
			}
			

			
			switch (staticscroll.colorScheme) {
				case 0: document.getElementById('cs_default').checked = true; break;
				case 1: document.getElementById('cs_solar_day').checked = true; break;
				case 2: document.getElementById('cs_solar_night').checked = true; break;
				case 3: document.getElementById('cs_low_contrast').checked = true; break;
			}
			
		}
		if (staticscroll.settingsDialog.style.visibility === "hidden") {
			staticscroll.settingsDialog.style.visibility = "visible";
			staticscroll.innerSettingsDialog.style.visibility = "visible";
		} else {
			staticscroll.settingsDialog.style.visibility = "hidden";
			staticscroll.innerSettingsDialog.style.visibility = "hidden";
		}
	},

	saveSettings: function() {
		var orignalFS = staticscroll.fontSize;
		if (document.getElementById('fs_small').checked) {
			ss_savelocal({'ss_fs': 0});
			staticscroll.fontSize = 0;
		} else if (document.getElementById('fs_default').checked) {
			ss_savelocal({'ss_fs': 1});
			staticscroll.fontSize = 1;
		} else if (document.getElementById('fs_large').checked) {
			ss_savelocal({'ss_fs': 2});
			staticscroll.fontSize = 2;
		} else if (document.getElementById('fs_largest').checked) {
			ss_savelocal({'ss_fs': 3});
			staticscroll.fontSize = 3;
		}


		if (document.getElementById('cs_default').checked) {
			ss_savelocal({'ss_cs': 0});
			staticscroll.colorScheme = 0;
		} else if (document.getElementById('cs_solar_day').checked) {
			ss_savelocal({'ss_cs': 1});
			staticscroll.colorScheme = 1;
		} else if (document.getElementById('cs_solar_night').checked) {
			ss_savelocal({'ss_cs': 2});
			staticscroll.colorScheme = 2;
		} else if (document.getElementById('cs_low_contrast').checked) {
			ss_savelocal({'ss_cs': 3});
			staticscroll.colorScheme = 3;
		}




		staticscroll.topPage.className = "ss_page fs_" + staticscroll.fontSize + " cs_" + staticscroll.colorScheme;
		staticscroll.bottomPage.className = "ss_page fs_" + staticscroll.fontSize + " cs_" + staticscroll.colorScheme;
		staticscroll.prepPage.className = "ss_page fs_" + staticscroll.fontSize + " cs_" + staticscroll.colorScheme;
		document.body.className = "ss_body ss_body_cs_" + staticscroll.colorScheme;
		if (staticscroll.colorScheme == 0) {
				document.body.style.backgroundImage = "url(" + chrome.extension.getURL("images/skewed_print.png") + ")";
			} else {
				document.body.style.backgroundImage = "none";
			}

		staticscroll.showHideSettingsDialog();

		if (orignalFS != staticscroll.fontSize) {
			staticscroll.doResize();
		}


	},

	loadFontSize: function(callback) {
		ss_loadlocal("ss_fs", function(fetchedData){
			if (fetchedData.ss_fs) {
				callback(fetchedData.ss_fs);
			} else {
				callback(1);
			}
		});
	},

	loadColorScheme: function(callback) {
		ss_loadlocal("ss_cs", function(fetchedData){
			if (fetchedData.ss_cs) {
				callback(fetchedData.ss_cs);
			} else {
				callback(0);
			}
		});	
	},

	resizeTimer: 0,

	doResize: function() {
		log("Resizing", 2);
		clearTimeout(staticscroll.resizeTimer);

		function resize() {
			staticscroll.bugReportDiv = null;
			staticscroll.innerHotKeyDialog = null;
			staticscroll.hotKeyDialog = null;
			staticscroll.innerSettingsDialog = null;
			staticscroll.settingsDialog = null;
			staticscroll.goalPage = staticscroll.pages[staticscroll.currentPage - 1] || 0;
			staticscroll.pages = [0];
			staticscroll.lastPage = -1;
			clearTimeout(staticscroll.processPageTimerId);
			staticscroll.processLock = false;
			staticscroll.currentPage = 0;
			staticscroll.scrollInfo = [];
			staticscroll.init();

		}


		staticscroll.resizeTimer = setTimeout(resize, 10);
		


	},

	updateProgressIndicator: function (currentCharCount) {
		if (currentCharCount > 0) {
			var progress = Math.round((currentCharCount * 10000) / staticscroll.article.length);
			staticscroll.progressIndicator.innerHTML = (progress / 100)  + "%";
		} else {
			staticscroll.progressIndicator.innerHTML = "0%";
		}
	},

	scrollForward: function() {
		var pageHeight = staticscroll.topPage.clientHeight;
		if (staticscroll.scrollInfo[staticscroll.currentPage - 1]) {
			var currentScrollInfo = staticscroll.scrollInfo[staticscroll.currentPage - 1];
			var i;
			for (i = 0; i < currentScrollInfo.length; i++) {
				if (pageHeight <= currentScrollInfo[i][1]) {
					break		
				}
			}
			if (i < currentScrollInfo.length - 1) {
				staticscroll.scroll(Math.max(1, currentScrollInfo[i + 1][1] - pageHeight));
			} else {
				staticscroll.scroll(30);
			}
		}
	},

	scrollBackward: function() {
		staticscroll.startScrollTime = 0;
		var pageHeight = staticscroll.topPage.clientHeight;
		if (pageHeight <= 0) {
			if (staticscroll.currentPage > 1) {
				staticscroll.showPrevPage();
				staticscroll.topPage.style.height= staticscroll.getMaxHeight() + "px";
				staticscroll.topRightHider.style.height = staticscroll.getMaxHeight() + "px";
			}
			
			return;
		}
		if (staticscroll.scrollInfo[staticscroll.currentPage - 1]) {
			var currentScrollInfo = staticscroll.scrollInfo[staticscroll.currentPage - 1];
			var i;
			for (i = 0; i < currentScrollInfo.length - 1; i++) {
				if (pageHeight <= currentScrollInfo[i][1]) {
					break;
				}
			}

			if (i < 1){
				 if (currentScrollInfo.length > 1) {
				 	if (staticscroll.currentPage > 1) {
						staticscroll.showPrevPage();
						staticscroll.topPage.style.height= staticscroll.getMaxHeight() + "px";
						staticscroll.topRightHider.style.height = staticscroll.getMaxHeight() + "px";
					}
				} else {
					staticscroll.scroll(-30);
				}
			} else if (i< currentScrollInfo.length - 1) {
				staticscroll.scroll(Math.min(-1, currentScrollInfo[i - 1][1] - pageHeight));
			} else {
				var delta = currentScrollInfo[i - 1][1] - pageHeight;
				staticscroll.scroll(Math.min(-1, Math.max(delta,-30)));
			}
		}

	},

	scroll: function(distance) {
		if (distance > 0) {
			distance = Math.min(distance, 75);
		} else {
			distance = Math.max(distance, -75);
		}
		var goal = staticscroll.topPage.clientHeight + distance;
		if (goal < 0) {
			staticscroll.showPrevPage();
		} else if (goal > staticscroll.getMaxHeight()) {
			staticscroll.showNextPage();
		} else {
			staticscroll.topPage.style.height = goal + "px";
			staticscroll.topRightHider.style.height = goal + "px";
		}
	},
	
	showNextPage: function() {
		staticscroll.getNextPage(function (pageText) {
			staticscroll.bottomPage.innerHTML = staticscroll.topPage.innerHTML;
			staticscroll.topPage.innerHTML = pageText;
			staticscroll.topPage.style.height = "0px";
			if (staticscroll.pages[staticscroll.currentPage - 1]) {
				staticscroll.updateProgressIndicator(staticscroll.pages[staticscroll.currentPage - 1]);
			}
			else {
				staticscroll.updateProgressIndicator(0);
			}
		})
		
	},

	showPrevPage: function(fromClick) {
		
		if (staticscroll.topPage.clientHeight > 50) {
			staticscroll.topPage.style.height = "0px";
		} else if (staticscroll.currentPage > 1) {
			staticscroll.getPrevPage(function (pageText) {
				staticscroll.topPage.innerHTML = staticscroll.bottomPage.innerHTML;
				staticscroll.bottomPage.innerHTML = pageText;
				if (fromClick) {
					staticscroll.topPage.style.height = "0px";
				} else {
					staticscroll.topPage.style.height = staticscroll.getMaxHeight() + "px";
				}
				if (staticscroll.pages[staticscroll.currentPage - 1]) {
					staticscroll.updateProgressIndicator(staticscroll.pages[staticscroll.currentPage - 1]);
				} else {
					staticscroll.updateProgressIndicator(0);
				}
				
			})	
		}
		
	},

	getMaxHeight: function() {
		return window.innerHeight - 80;
	},

	createUI: function() {
		log("Creating UI 8", 2);
		var nextButton = document.createElement("img");
		nextButton.src = ss_url("images/next_1.png");
		nextButton.className = "ss_nav_button ss_unselected";
		var width = Math.round(Math.min(window.innerWidth - 60, Math.max(window.innerHeight * 0.618, 400) + 20));
		var left = (((window.innerWidth - (width + 120)) / 4) - 24);
		var top = ((window.innerHeight / 2) - 24) + "px";
		nextButton.style.left = (window.innerWidth - ((left * 2) + 48))+ "px";
		left = left + "px";
		nextButton.style.paddingLeft = left;
		nextButton.style.paddingRight = left;
		nextButton.style.paddingTop = top;
		nextButton.style.paddingBottom = top;
		nextButton.onmouseover = function (event) {
			nextButton.className = "ss_nav_button";
		}
		nextButton.onmouseout = function (event) {
			nextButton.className = "ss_nav_button ss_unselected";
		}

		nextButton.onclick = function (event) {
			staticscroll.showNextPage();
		}

		var prevButton = document.createElement("img");
		prevButton.src = ss_url("images/previous_1.png");
		prevButton.className = "ss_nav_button ss_unselected";
		prevButton.style.paddingLeft = left;
		prevButton.style.paddingRight = left;
		prevButton.style.paddingTop = top;
		prevButton.style.paddingBottom = top;
		prevButton.onmouseover = function (event) {
			prevButton.className = "ss_nav_button";
		}
		prevButton.onmouseout = function (event) {
			prevButton.className = "ss_nav_button ss_unselected";
		}

		prevButton.onclick = function (event) {
			staticscroll.showPrevPage(true);
		}

		staticscroll.updatePlayButton();
		staticscroll.playButton.onclick = function (event) {
			staticscroll.startStopScroll();
		}
			

		var fastButton = document.createElement("img");
		fastButton.src = ss_url("images/plus_1.png");
		fastButton.title = "Increase Scroll Speed";

		fastButton.className = "ss_control_button ss_fast_button ss_unselected";
		fastButton.onmouseover = function (event) {
			fastButton.className = "ss_control_button ss_fast_button";
		}
		fastButton.onmouseout = function (event) {
			fastButton.className = "ss_control_button ss_fast_button ss_unselected";
		}

		fastButton.onclick = function (event) {
			staticscroll.increaseScrollSpeed();
		}

		var slowButton = document.createElement("img");
		slowButton.src = ss_url("images/minus_1.png");
		slowButton.title = "Decrease Scroll Speed";
		slowButton.className = "ss_control_button ss_slow_button ss_unselected";
		slowButton.onmouseover = function (event) {
			slowButton.className = "ss_control_button ss_slow_button";
		}
		slowButton.onmouseout = function (event) {
			slowButton.className = "ss_control_button ss_slow_button ss_unselected";
		}

		slowButton.onclick = function (event) {
			staticscroll.decreaseScrollSpeed();
		}

	
		var refreshButton = document.createElement("img");
		refreshButton.src = ss_url("images/refresh_1.png");
		refreshButton.title = "Reload Original Page";
		refreshButton.className = "ss_refresh_button ss_unselected";
		refreshButton.onmouseover = function (event) {
			refreshButton.className = "ss_refresh_button";
		}
		refreshButton.onmouseout = function (event) {
			refreshButton.className = "ss_refresh_button ss_unselected";
		}

		refreshButton.onclick = function (event) {
			window.location.reload();
		}

		var bugButton = document.createElement("img");
		bugButton.src = ss_url("images/bug_1.png");
		bugButton.title = "Report a bug and we'll fix it";
		bugButton.className = "ss_bug_button ss_unselected";
		bugButton.onmouseover = function (event) {
			bugButton.className = "ss_bug_button";
		}
		bugButton.onmouseout = function (event) {
			bugButton.className = "ss_bug_button ss_unselected";
		}

		bugButton.onclick = function (event) {
			staticscroll.showBugReport();
		}
		
		var settingsButton = document.createElement("img");
		settingsButton.src = ss_url("images/settings.png");
		settingsButton.title = "Change colors and font sizes";
		settingsButton.className = "ss_settings_button ss_unselected";
		settingsButton.onmouseover = function (event) {
			settingsButton.className = "ss_settings_button";
		}
		settingsButton.onmouseout = function (event) {
			settingsButton.className = "ss_settings_button ss_unselected";
		}

		settingsButton.onclick = function (event) {
			staticscroll.showHideSettingsDialog();
		}



		staticscroll.scroll_speed_display = document.createElement("div");
		staticscroll.scroll_speed_display.className = "ss_control_button ss_scroll_speed";
		
		document.body.appendChild(settingsButton);
		document.body.appendChild(bugButton);
		document.body.appendChild(refreshButton);
		document.body.appendChild(staticscroll.scroll_speed_display);
		document.body.appendChild(nextButton);
		document.body.appendChild(prevButton);
		document.body.appendChild(staticscroll.playButton);
		document.body.appendChild(fastButton);
		document.body.appendChild(slowButton);
		staticscroll.showBugReport();
		staticscroll.registerHotKeys();
	},

	showCenteredBugReport: function() {
		staticscroll.hotKeyDialog = document.createElement("div");
		staticscroll.innerHotKeyDialog = document.createElement("p");
		staticscroll.hotKeyDialog.className = "ss_hotkey_container";
		staticscroll.innerHotKeyDialog.className = "ss_hotkey_dialog";
		staticscroll.hotKeyDialog.style.visibility = "hidden";

			staticscroll.innerHotKeyDialog.innerHTML = "<p>Sorry, MagicScroll was unable to parse this page for content.  If you feel like it should have been able to, please report this page using the button bellow:</p>";

			staticscroll.bugReportButton = document.createElement("input");
			staticscroll.bugReportButton.type = "button";
			staticscroll.bugReportButton.value = "Report This Page";
			staticscroll.innerHotKeyDialog.appendChild(staticscroll.bugReportButton);

			staticscroll.bugReportButton.onclick = function(event) {
				var url = encodeURIComponent(window.location.href);
				var meta = "Unable to parse page";
				log("Reporting url: " + url + " meta: " + meta, 0);
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "http://hrscs04.appspot.com/reportbug?url=" + url + "&meta=" + meta, true);
				xhr.send();
				staticscroll.showBugReport();
				window.alert("Thanks for the report.  We'll try to fix it quickly");
			};


			staticscroll.innerHotKeyDialog.style.marginTop = (((window.innerHeight - 220) / 2) - 50) + "px";
			staticscroll.innerHotKeyDialog.style.marginLeft = (((window.innerWidth - 580) / 2) - 15) + "px";

			document.body.appendChild(staticscroll.hotKeyDialog);
			document.body.appendChild(staticscroll.innerHotKeyDialog);
	},


	showBugReport: function() {
		if (!staticscroll.bugReportDiv) {
			staticscroll.bugReportDiv = document.createElement("div");
			staticscroll.bugReportMetaInput = document.createElement("textarea");
			staticscroll.bugReportMetaInput.cols = 50;
			staticscroll.bugReportMetaInput.rows = 4;


			staticscroll.bugReportDiv.appendChild(staticscroll.bugReportMetaInput);
			staticscroll.bugReportButton = document.createElement("input");
			staticscroll.bugReportCloseButton = document.createElement("input");
			staticscroll.bugReportCloseButton.type = "button";
			staticscroll.bugReportCloseButton.value = "Cancel";
			staticscroll.bugReportButton.type = "button";
			staticscroll.bugReportButton.value = "Report Bug";
			staticscroll.bugReportDiv.className="ss_bug_report_div";
			staticscroll.bugReportMetaInput.innerText = "Thanks for helping us improve. Please write a short description of the bug here."
			staticscroll.bugReportDiv.appendChild(staticscroll.bugReportCloseButton);
			staticscroll.bugReportDiv.appendChild(staticscroll.bugReportButton);
			document.body.appendChild(staticscroll.bugReportDiv);
			staticscroll.bugReportButton.onclick = function(event) {
				var url = encodeURIComponent(window.location.href);
				var meta = staticscroll.bugReportMetaInput.value;
				log("Reporting url: " + url + " meta: " + meta, 0);
				var xhr = new XMLHttpRequest();
				xhr.open("GET", "http://magicscrollanalytics.appspot.com/reportbug?url=" + url + "&meta=" + meta, true);
				xhr.send();
				staticscroll.showBugReport();
				window.alert("Thanks for the report.  We'll try to fix it quickly");
			};
			staticscroll.bugReportCloseButton.onclick = function(event) {
				staticscroll.showBugReport();
			};
			staticscroll.bugReportDiv.style.visibility = "visible";

		}
		if (staticscroll.bugReportDiv.style.visibility === "hidden") {
			staticscroll.hotKeysEnabled = false;
			staticscroll.bugReportDiv.style.visibility = "visible";
		} else {
			staticscroll.hotKeysEnabled = true;
			staticscroll.bugReportDiv.style.visibility = "hidden";
		}
	},


	showScrollSpeed: function() {
		staticscroll.scroll_speed_display.innerHTML = staticscroll.scrollSpeed + " characters per second";
		staticscroll.scroll_speed_display.style.visibility = "visible";
		setTimeout(staticscroll.hideScrollSpeed, 3000);
	},

	hideScrollSpeed: function() {
		staticscroll.scroll_speed_display.style.visibility = "hidden";
	},

	isScrolling: false,

	updatePlayButton: function() {
		if (!staticscroll.playButton) {
			staticscroll.playButton = document.createElement("img");
			staticscroll.playButton.className = "ss_control_button ss_play_button ss_unselected";
			staticscroll.playButton.onmouseover = function (event) {
				staticscroll.playButton.className = "ss_control_button ss_play_button";
			}
			staticscroll.playButton.onmouseout = function (event) {
				staticscroll.playButton.className = "ss_control_button ss_play_button ss_unselected";
			}
	
		}
		if (staticscroll.isScrolling) {
			staticscroll.playButton.src = ss_url("images/pause_1.png");
			staticscroll.playButton.title = "Pause Scrolling";
		} else {
			staticscroll.playButton.src = ss_url("images/play_1.png");
			staticscroll.playButton.title = "Start Scrolling";
		}
	},

	startScrollTime: 0,
	startScrollHeight: 0,
	totalScrollDistance: 0,
	totalScrollTime: 0,
	timeOutId: 0,


	startStopScroll: function() {
		if (staticscroll.isScrolling) {
			window.clearInterval(staticscroll.timeOutId);
			staticscroll.startScrollTime = 0;
			staticscroll.isScrolling = false;
		} else {
			staticscroll.isScrolling = true;
			staticscroll.timeOutId = window.setInterval(staticscroll.autoScroll, 1);
		}
		staticscroll.updatePlayButton();
	},

	autoScroll: function() {
		var pageHeight = staticscroll.topPage.clientHeight;
		if (staticscroll.startScrollTime === 0) {
			staticscroll.startScrollTime = new Date().getTime();
			if (staticscroll.scrollInfo[staticscroll.currentPage - 1]) {
				var currentScrollInfo = staticscroll.scrollInfo[staticscroll.currentPage - 1];
				var i;
				for (i = 0; i < currentScrollInfo.length; i++) {
					if (pageHeight <= currentScrollInfo[i][1]) {
						break		
					}
				}
				if (currentScrollInfo[i + 1]){
					staticscroll.totalScrollDistance = currentScrollInfo[i + 1][1] - pageHeight;
					var charactersInSection = currentScrollInfo[i + 1][0];
					staticscroll.totalScrollTime = Math.max(staticscroll.totalScrollDistance * 10, ((charactersInSection * 1000) / staticscroll.scrollSpeed));
				} else {
					if (staticscroll.scrollInfo[staticscroll.currentPage]) {
						staticscroll.startScrollTime = 0;
						staticscroll.showNextPage();
					} else {
						staticscroll.progressIndicator.innerHTML = "99.99%";
						staticscroll.startStopScroll();
						return;
					}
				}
			} else {
				staticscroll.startStopScroll();
				return;
			}
			staticscroll.startScrollHeight = pageHeight;
		}

		if (pageHeight < staticscroll.totalScrollDistance + staticscroll.startScrollHeight) {
			var deltaTime = Math.max(new Date().getTime() - staticscroll.startScrollTime, 1);
			var goalDistance = Math.round((deltaTime / staticscroll.totalScrollTime) * staticscroll.totalScrollDistance);
			staticscroll.topPage.style.height = (staticscroll.startScrollHeight + goalDistance) + "px";
			staticscroll.topRightHider.style.height = (staticscroll.startScrollHeight + goalDistance) + "px";
		} else {
			staticscroll.startScrollTime = 0;
		}

	},

	loadScrollSpeed: function() {
		ss_loadsync("ss_scroll_speed", function(fetchedData){
			if (fetchedData.ss_scroll_speed) {
				staticscroll.scrollSpeed = fetchedData.ss_scroll_speed;
			} 
		});
		
		
	},

	saveScrollSpeed: function(scrollSpeed) {
		staticscroll.showScrollSpeed();
		ss_savesync({'ss_scroll_speed': scrollSpeed});
	},

	increaseScrollSpeed: function() {
		staticscroll.saveScrollSpeed(++staticscroll.scrollSpeed);
	},

	decreaseScrollSpeed: function() {
		staticscroll.saveScrollSpeed(--staticscroll.scrollSpeed);
	},

	
	nextWordLocalVar: {}, 

	resetNextWordLocalVar: function(articleIndex, remaining){
		staticscroll.nextWordLocalVar.articleIndex = articleIndex;
		staticscroll.nextWordLocalVar.heightInfo  = [];
		staticscroll.nextWordLocalVar.remaining = remaining;
		staticscroll.nextWordLocalVar.pageLength =  Math.max(1, remaining.nextWordIndex(0));
		staticscroll.prepPage.innerHTML = remaining.substring(0, staticscroll.nextWordLocalVar.pageLength);
		staticscroll.nextWordLocalVar.wordLength = remaining.nextWordIndex(staticscroll.nextWordLocalVar.pageLength + 1);
		staticscroll.nextWordLocalVar.pageHeight = 0;
		staticscroll.nextWordLocalVar.prevPageHeight = 0;
	},

	processLock: false,
	processPages: function () {
		if (!staticscroll.processLock) {
			staticscroll.processLock = true;
			var articleIndex = staticscroll.pages[staticscroll.pages.length - 1];

			if (articleIndex < staticscroll.article.length - 1) {
				staticscroll.resetNextWordLocalVar(articleIndex, staticscroll.article.substring(articleIndex));
				staticscroll.processWords(function(){
					staticscroll.processLock = false;
					if ((staticscroll.pages.length < (staticscroll.currentPage + 5)) || (staticscroll.goalPage !== 0)){
						staticscroll.processPages();
					} 
				});
				
			} else {
				staticscroll.lastPage = staticscroll.pages.length - 1;

			}
		}
	},

	processWords : function(callback) {
		var wordCount = 1;
		function setPageHeight() {
			staticscroll.nextWordLocalVar.pageHeight = staticscroll.prepPage.clientHeight;
			processNextWord();
		}

		function processNextWord() {
			if ((staticscroll.nextWordLocalVar.wordLength != -1) && (staticscroll.nextWordLocalVar.pageHeight < staticscroll.getMaxHeight())) {
				if (staticscroll.nextWordLocalVar.prevPageHeight < staticscroll.nextWordLocalVar.pageHeight) {
					var currentIndex = staticscroll.nextWordLocalVar.articleIndex + staticscroll.nextWordLocalVar.pageLength;
					var line = staticscroll.article.substring(staticscroll.nextWordLocalVar.prevIndex, currentIndex).replace(/<[^>]*/img, "");
					staticscroll.nextWordLocalVar.heightInfo.push([line.length, staticscroll.nextWordLocalVar.prevPageHeight]);
					staticscroll.nextWordLocalVar.prevPageHeight = staticscroll.nextWordLocalVar.pageHeight;
					staticscroll.nextWordLocalVar.prevIndex = currentIndex;
				}
				staticscroll.nextWordLocalVar.pageLength = staticscroll.nextWordLocalVar.wordLength;				
				
				staticscroll.nextWordLocalVar.wordLength = staticscroll.nextWordLocalVar.remaining.nextWordIndex(staticscroll.nextWordLocalVar.pageLength + 1);
				var pageText = staticscroll.nextWordLocalVar.remaining.substring(0, staticscroll.nextWordLocalVar.wordLength);
				staticscroll.prepPage.innerHTML = pageText;
				if (wordCount++ % 75 == 0) {  //Give Gecko A Rest
					setTimeout(setPageHeight, 1);
				} else {
					setPageHeight();
				}
			} else {
				var pageIndex = staticscroll.nextWordLocalVar.articleIndex + staticscroll.nextWordLocalVar.pageLength;
				var lastClose = staticscroll.article.indexOf(">", pageIndex - 1);
				if (lastClose !== -1){
					var lastOpen = staticscroll.article.indexOf("<", pageIndex - 1);
					if ((lastOpen === -1) || (lastOpen > lastClose)) {
						pageIndex = Math.min(lastClose + 1, staticscroll.article.length -1);
					}
				}
				var line = staticscroll.article.substring(staticscroll.nextWordLocalVar.prevIndex, pageIndex).replace(/<[^>]*/img, "");
				staticscroll.nextWordLocalVar.heightInfo.push([line.length, staticscroll.nextWordLocalVar.prevPageHeight]);
				staticscroll.scrollInfo.push(staticscroll.nextWordLocalVar.heightInfo);
				staticscroll.nextWordLocalVar.prevIndex = pageIndex;
				
				staticscroll.pages.push(pageIndex);
				if (staticscroll.pages.length === 3) {
					staticscroll.showNextPage();
					staticscroll.showNextPage();
				}
				if ((staticscroll.goalPage !== 0) && (pageIndex > staticscroll.goalPage)) {
					log("Goal Page: " + staticscroll.goalPage, 2);
					staticscroll.currentPage = Math.max(0, staticscroll.pages.length - 3);
					staticscroll.showNextPage();
					staticscroll.showNextPage();
					staticscroll.goalPage = 0;
				}
				callback();
			}
		}
		setPageHeight();
	},



	getNextPage: function (callback) {
		if (staticscroll.lastPage == -1) {
			if (staticscroll.pages[staticscroll.currentPage + 1]) {
				callback(staticscroll.article.substring(staticscroll.pages[staticscroll.currentPage++], staticscroll.pages[staticscroll.currentPage]));
				staticscroll.processPages();
			} else {
			}
		} else {
			if (staticscroll.currentPage < staticscroll.lastPage) {
				callback(staticscroll.article.substring(staticscroll.pages[staticscroll.currentPage++], staticscroll.pages[staticscroll.currentPage]));
			} else {
				staticscroll.topPage.style.height = staticscroll.getMaxHeight() + "px";
				staticscroll.topRightHider.style.height = staticscroll.getMaxHeight() + "px";
				staticscroll.progressIndicator.innerHTML = "99.99%";
			}
		}
	
	},

	getPrevPage: function (callback) {
		if ((staticscroll.topPage.clientHeight > 50) && (staticscroll.startScrollTime === 0)) {
			staticscroll.topPage.style.height= "0px";
			staticscroll.topRightHider.style.height = "0px";
			if (staticscroll.pages[staticscroll.currentPage - 1]) {
				staticscroll.updateProgressIndicator(staticscroll.pages[staticscroll.currentPage - 1]);
			} else {
				staticscroll.updateProgressIndicator(0);
			}
			// staticscroll.startScrollTime = 0;
		} else if (staticscroll.currentPage > 1) {
			callback(staticscroll.article.substring(staticscroll.pages[--staticscroll.currentPage - 2], staticscroll.pages[staticscroll.currentPage - 1]));
		}

			
	
	},
	
};


