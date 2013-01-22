var log = function(s, level) {
	if (!level) {
		level = 0;
	}
	if ((level < 5) && (typeof console !== 'undefined')) {
		console.log(s);
	}
};