chrome.storage.local.get(["ss_fs", "ss_cs"], function(fetchedData){
	staticscroll.fontSize = fetchedData.ss_fs || 1;
	staticscroll.colorScheme = fetchedData.ss_cs || 0;
	staticscroll.init();
});



