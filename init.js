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
	return "http://www.magicscroll.net/bookmarklet/" + resource;
};



var link = document.createElement("link");
link.href = ss_url("staticscroll.css");
link.type = "text/css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);

function loadScript(src) {
	var script = document.createElement('script'); 
	script.src = ss_url("staticscroll.css");
	document.documentElement.appendChild(script);
}

var scripts = ["readability.js", "staticscroll.js"];

loadScript(scripts[0]);



var intId = setInterval("loadStaticScroll()", 10);

function loadStaticScroll() {
	if ((readability) && (!staticscroll)) {
		loadScript(scripts[1]);
	} else if (staticscroll) {
		staticscroll.init();
		clearInterval(intId);
	}
	
}

