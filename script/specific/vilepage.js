var page = Vile.initialize()
window.addEventListener('load',function(){

	setTimeout(function(){
		document.title = "Vile.js | Kley & Verin"
		$(page.app_header).removeClass('big')
		$(page.loading_indicator).addClass('disappear')
	},2000)

},true)
