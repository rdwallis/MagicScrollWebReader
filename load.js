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