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

var basedir="http://www.magicscroll.net/bookmarklet/";

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

var readability = {
	article: document.body.innerHTML.replace("[BASEDIR]", basedir)
}

loadScript("staticscroll.js");




