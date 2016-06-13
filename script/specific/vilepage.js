Vile.Element.activate('kv-loadicon-wave')

var page = {}

$(document).ready(function(){
	Vile.initialize(page)
	setTimeout(function(){
		document.title = "Vile.js | Kley &amp; Verin";
		$(page.loadingScreen).fadeOut()
	},1000)
	/*
		$(page.loadingScreen).fadeOut()
	*/
})
