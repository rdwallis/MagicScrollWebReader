var log = function(s, level) {
	if (!level) {
		level = 0;
	}
	if ((level < 0) && (typeof console !== 'undefined')) {
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
	return chrome.extension.getURL(resource);
};

var ss_loadlocal = function(key, callback) {
	chrome.storage.local.get(key, callback);
};

var ss_savelocal = function (object) {
	chrome.storage.local.set(object);
};

var ss_loadsync = function(key, callback) {
	chrome.storage.sync.get(key, callback);
};

var ss_savesync = function(object) {
	chrome.storage.sync.set(object);
};