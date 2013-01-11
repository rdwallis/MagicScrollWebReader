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

var scripts = ["readability.js", "staticScroll.js"];

loadScript(scripts[0]);



var intId = setInterval("loadStaticScroll()", 50);

function loadStaticScroll() {
	if (readability) {
		clearInterval(intId);
		loadScript(scripts[1]);

		
	}
}

