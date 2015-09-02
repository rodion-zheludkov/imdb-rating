var EXPORTED_SYMBOLS = [ ];

Components.utils.import("resource://imdbrating/imdbRatingCommon.js");

// Observable object. Main purpose - get page via XmlHttpRequest and notify 
// listeners with page context
ImdbRating.RequestNotifier = function() {
    this.lsnrs = new Array();
	this.req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                .createInstance(Components.interfaces.nsIXMLHttpRequest);
}

ImdbRating.RequestNotifier.prototype.addListener = function(lsnr) {
    this.lsnrs = ImdbRating.arrayAppend(this.lsnrs, lsnr);
}

ImdbRating.RequestNotifier.prototype.removeListener = function(lsnr) {
    this.lsnrs = ImdbRating.arrayRemove(this.lsnrs, lsnr);
}

ImdbRating.RequestNotifier.prototype.notify = function() {
	for(var i = 0; i < this.lsnrs.length; i++) {
		this.lsnrs[i].run(this.page)
	}
}

ImdbRating.RequestNotifier.prototype.process = function(url) {
	var requestNotifier = this;
	this.req.open('GET', url, true);
	this.req.onreadystatechange = function (aEvt) {
		var req = requestNotifier.req;
		if (req.readyState == 4) {
			if(req.status == 200) {
				var page = req.responseText;
				requestNotifier.page = page;
				requestNotifier.notify();
			}
		}
	}
	this.req.send(null);
	
}



//IMDB page parser
ImdbRating.Parser = function() {
	this.nameRe = /<title>(.+) \- IMDb<\/title>/;
	this.ratingRe = /itemprop=\"ratingValue\">(.+?)</;
}

ImdbRating.Parser.prototype.getName = function(text) {
	var result = this.nameRe.exec(text);
	if(result != null) {
		return result[1];
	}
}

ImdbRating.Parser.prototype.getRating = function(text) {
	var result = this.ratingRe.exec(text);
	if(result != null) {
		return result[1];
	}
}

ImdbRating.Converter = function() {
}

ImdbRating.Converter.prototype.convert = function(value) {
	value = value.replace(/&#34;/g, "\"");
	value = value.replace(/&amp;/g, "&");
	return value;
}

ImdbRating.AlertListener = function() {
	this.parser = new ImdbRating.Parser();
	this.converter = new ImdbRating.Converter();
	this.alertsService = 
        Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
}

ImdbRating.AlertListener.prototype.run = function(page) {
	var name = this.parser.getName(page);
	var rating = this.parser.getRating(page);
	//dump(name+":"+rating+"\n");
	if(name == null || rating == null) {
		name = "Not Found";
		rating = "0.0/10";
	} else {
		name = this.converter.convert(name);
	}
	this.alertsService.showAlertNotification("", name, rating, false, "", null);
}

ImdbRating.SearchCommand = function(requestNotifier) {
	this.invoke = function() {
        var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow("navigator:browser");
		var selectedText = mainWindow.document.commandDispatcher.focusedWindow
            .getSelection().toString();
		selectedText = selectedText.replace(/&/g, " and ");
        selectedText = ImdbRating.stringTrim(selectedText).replace(/ +/g, "+");
		var url = "http://www.google.com/search?q=" + encodeURIComponent(selectedText) +"+site:imdb.com&btnI=true";
		//dump(url+"\n");
		requestNotifier.process(url);
	}
}

ImdbRating.ImdbMenuEntry = function(contextMenu, menuEntry, searchCommand) {
	this.contextMenu = contextMenu;
	this.menuEntry = menuEntry;
	this.menuEntry.addEventListener("command", searchCommand.invoke, false)

	var imdbMenuEntry = this;
	
	this.contextMenu.addEventListener(
		"popupshowing", 
		function() {
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator)
                .getMostRecentWindow("navigator:browser");
            var gContextMenu = mainWindow.gContextMenu;
    	    imdbMenuEntry.menuEntry.hidden = !(gContextMenu.isTextSelected);
		}, 
		false
	);
}
