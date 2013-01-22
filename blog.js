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

var scripts = ["log.js", "staticscroll.js"];

loadScript(scripts[0]);

var readability = {
	article: document.body.innerHTML.replace("[HOST]", window.location.host)
}

loadScript(scripts[1]);




