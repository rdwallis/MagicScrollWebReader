staticscroll.showHideSettingsDialog = function() {
	log("Showing Settings Dialog", 2);
	if (!staticscroll.settingsDialog) {
		log("Creating settings dialog", 2);
		staticscroll.settingsDialog = document.createElement("div");
		staticscroll.innerSettingsDialog = document.createElement("p");
		staticscroll.settingsDialog.className = "ss_settings_container";
		staticscroll.innerSettingsDialog.className = "ss_settings_dialog";
		staticscroll.settingsDialog.style.visibility = "hidden";
		staticscroll.innerSettingsDialog.innerHTML = "<h2>Change Settings: </h2><table cellspacing='10'>"
		+ "<tr><td><table class='ss_radioSettings'><tr><th colspan='2'>Font Size:</th></tr>" 
		+ "<tr><td>Small</td><td><input type='radio' name='fontSize' value='small' id='fs_small'></td></tr>"
		+ "<tr><td>Default</td><td><input type='radio' name='fontSize' value='default' id='fs_default'></td></tr>"
		+ "<tr><td>Large</td><td><input type='radio' name='fontSize' value='large' id='fs_large'></td></tr>"
		+ "<tr><td>Largest</td><td><input type='radio' name='fontSize' value='largest' id='fs_largest'></td></tr>"
		+ "</table></td><td><table class='ss_radioSettings'><tr><th colspan='2'>Color Scheme:</th></tr>"
		+ "<tr><td>Default</td><td><input type='radio' name='colorScheme' value='default' id='cs_default'></td></tr>"
		+ "<tr><td>Solar Day</td><td><input type='radio' name='colorScheme' value='Solar Day' id='cs_solar_day'></td></tr>"
		+ "<tr><td>Solar Night</td><td><input type='radio' name='colorScheme' value='Solar Night' id='cs_solar_night'></td></tr>"
		+ "<tr><td>Low Contrast</td><td><input type='radio' name='colorScheme' value='Low Contrast' id='cs_low_contrast'></td></tr>"
		+ "</table></td></table>"
		+ "<input type='button' value='Save Settings' class='ss_settingsSave' id='ss_saveSettings'/><input type='button' value='Cancel' id='ss_cancelSettings'/>";
		staticscroll.innerSettingsDialog.style.marginTop = (((window.innerHeight - 288) / 2) - 50) + "px";
		staticscroll.innerSettingsDialog.style.marginLeft = (((window.innerWidth - 464) / 2) - 15) + "px";


		staticscroll.settingsDialog.onclick = function (event) {
			staticscroll.showHideSettingsDialog();
		};

		document.body.appendChild(staticscroll.settingsDialog);
		document.body.appendChild(staticscroll.innerSettingsDialog);

		document.getElementById("ss_cancelSettings").onclick = function() {
			staticscroll.showHideSettingsDialog();
		}

		document.getElementById("ss_saveSettings").onclick = function() {
			staticscroll.saveSettings();
		}

		
		switch (staticscroll.fontSize) {
			case 0: document.getElementById('fs_small').checked = true; break;
			case 1: document.getElementById('fs_default').checked = true; break;
			case 2: document.getElementById('fs_large').checked = true; break;
			case 3: document.getElementById('fs_largest').checked = true; break;
		}
		

		
		switch (staticscroll.colorScheme) {
			case 0: document.getElementById('cs_default').checked = true; break;
			case 1: document.getElementById('cs_solar_day').checked = true; break;
			case 2: document.getElementById('cs_solar_night').checked = true; break;
			case 3: document.getElementById('cs_low_contrast').checked = true; break;
		}
		
	}
	if (staticscroll.settingsDialog.style.visibility === "hidden") {
		staticscroll.settingsDialog.style.visibility = "visible";
		staticscroll.innerSettingsDialog.style.visibility = "visible";
	} else {
		staticscroll.settingsDialog.style.visibility = "hidden";
		staticscroll.innerSettingsDialog.style.visibility = "hidden";
	}
};

chrome.storage.local.get(["ss_fs", "ss_cs"], function(fetchedData){
	staticscroll.fontSize = fetchedData.ss_fs || 1;
	staticscroll.colorScheme = fetchedData.ss_cs || 0;
	staticscroll.init();
});



