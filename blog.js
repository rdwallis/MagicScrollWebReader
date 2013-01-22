var link = document.createElement("link");
link.href = "staticscroll.css";
link.type = "text/css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);

function loadScript(src) {
	var script = document.createElement('script'); 
	script.src = src;
	document.documentElement.appendChild(script);
}

var scripts = ["log.js", "staticscroll.js"];

loadScript(scripts[0]);

var readability = {
	article: document.body.innerHTML
}

loadScript(scripts[1]);




