Vile.Element.activate('kv-loadicon-wave')

var page = {}
$(document).ready(function(){
	Vile.initialize(page)
	page.download = {
		showWarning: function(){
			page.infoWarning.show();
			setTimeout(function(){
				//page.infoWarning.addClass('hidden');
				page.infoWarning.fadeOut()
			},5000)
		}
	}
	page.h1Demo.append(page.e.make('h3',{
		class:'vile',
		onclick:'dosomething()'
		},'Vile.js'))
	setTimeout(function(){
		document.title = "Vile.js | Kley & Verin";
		$(page.loadingScreen).fadeOut()
		$('body').removeClass('restrict-overflow')
	},1000)
	/*
		$(page.loadingScreen).fadeOut()
	*/
})
