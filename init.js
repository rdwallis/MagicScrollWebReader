var log = function(s, level) {
	if (!level) {
		level = 0;
	}
	if ((level < 5) && (typeof console !== 'undefined')) {
		console.log(s);
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

var scripts = ["readability.js", "staticscroll.js"];

loadScript(scripts[0]);



var intId = setInterval("loadStaticScroll()", 10);

function loadStaticScroll() {
	if (readability) {
		clearInterval(intId);
		loadScript(scripts[1]);
	}
}

