var basedir="http://www.magicscroll.net/bookmarklet/";

var log = function(s, level) {
	if (!level) {
		level = 0;
	}
	if ((level < 3) && (typeof console !== 'undefined')) {
		console.log(s);
	}
};

String.prototype.nextWordIndex = function(startpos) {
	var sub = this.substring(startpos || 0);
	var indexOf = sub.search(/(<|\s|>\S)/img);
	if (indexOf >= 0) {
		if (sub[indexOf] === "<") {
			if (indexOf < sub.length - 10) {
				if (sub[indexOf + 1] == "a") {
					return sub.indexOf("</a>", indexOf) + 4 + (startpos || 0);
				}
			}

			if (indexOf < sub.length - 10) {
				if (sub[indexOf + 1] == "y") {
					return sub.indexOf("</y>", indexOf) + 4 + (startpos || 0);
				}
			}
			indexOf = sub.search(/>/img);
			if (indexOf == -1) {
				return sub.search(/</img) + (startpos || 0);
			}
		}
		if ((sub[indexOf] === ">") && (indexOf < sub.length - 2)) {
			indexOf++;
		}
		return indexOf + (startpos || 0);
	} else {
		return indexOf;
	}
};

var ss_url = function(resource) {
	return basedir + resource;
};

var ss_state = {};

var ss_loadlocal = function(key, callback) {
	callback(ss_state);
};

var ss_savelocal = function (obj) {
	for (var key in obj) {
		ss_state[key] = obj[key];
	}
};

var ss_loadsync = function(key, callback) {
	ss_loadlocal(key, callback);
};

var ss_savesync = function(object) {
	ss_savelocal(object);
};

var ss_load = {
	loadDialog: null,
	glass: null,
	init: function() {
		log("Starting load dialog", 2);
		ss_load.glass = document.createElement("p");
		ss_load.loadDialog = document.createElement("img");
		ss_load.glass.className = "ss_load_container";
		ss_load.loadDialog.className = "ss_load_dialog";
		ss_load.loadDialog.src = ss_url("images/load.gif");
		document.body.appendChild(ss_load.glass);
		document.body.appendChild(ss_load.loadDialog);
	},
	hide: function() {
		ss_load.glass.style.visibility = "hidden";
		ss_load.loadDialog.style.visibility = "hidden";
	}
}

var link = document.createElement("link");
link.href = basedir + "staticscroll.css";
link.type = "text/css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);

function loadScript(src) {
	var script = document.createElement('script'); 
	script.src = basedir + src;
	document.documentElement.appendChild(script);
}







loadScript("staticscroll.js");

var intId = setInterval("loadStaticScroll()", 10);

function loadStaticScroll() {
	if (typeof staticscroll != 'undefined') {
		staticscroll.init();
		clearInterval(intId);
	}
	
}



