var basedir="http://www.magicscroll.net/bookmarklet/";

var log = function(s, level) {
	if (!level) {
		level = 0;
	}
	if ((level < 1) && (typeof console !== 'undefined')) {
		console.log(s);
	}
};

String.prototype.nextWordIndex = function(startpos) {
	var sub = this.substring(startpos || 0);
	var indexOf = sub.search(/(<|\s|>\S)/img);
	if (indexOf >= 0) {
		if (sub[indexOf] === "<") {
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

var ss_state = (typeof window.ss_bookmarkletstate != 'undefined') ? window.ss_bookmarkletstate : {};



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


var link = document.createElement("link");
link.href = ss_url("staticscroll.css");
link.type = "text/css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);

function loadScript(src) {
	var script = document.createElement('script'); 
	script.src = ss_url(src);
	document.documentElement.appendChild(script);
}

var scripts = ["readability.js", "staticscroll.js"];

loadScript(scripts[0]);



var intId = setInterval("loadStaticScroll()", 10);

function loadStaticScroll() {
	if ((typeof readability != 'undefined') && (typeof staticscroll == 'undefined')) {
		loadScript(scripts[1]);
	} else if (typeof staticscroll != 'undefined') {
		staticscroll.fontSize = ss_state.ss_fs || 1;
		staticscroll.colorScheme = ss_state.ss_cs || 0;
		staticscroll.init();
		clearInterval(intId);
	}
	
}

