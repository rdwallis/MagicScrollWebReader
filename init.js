var basedir="http://900.magicscrollreader.appspot.com/bookmarklet/";

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

var scripts = ["log.js", "readability.js", "staticscroll.js"];

loadScript(scripts[0]);
loadScript(scripts[1]);



var intId = setInterval("loadStaticScroll()", 10);

function loadStaticScroll() {
	if (readability) {
		clearInterval(intId);
		loadScript(scripts[2]);
	}
}

