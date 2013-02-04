var ss_load = {
	glass: null,
	show: function() {
		if (ss_load.glass == null) {
			log("Starting load dialog", 2);
			ss_load.glass = document.createElement("p");
			ss_load.glass.className = "ss_load_container";
			document.body.appendChild(ss_load.glass);
		}
		ss_load.glass.style.visibility = "visible";
	},
	hide: function() {
		ss_load.glass.style.visibility = "hidden";
	}
}