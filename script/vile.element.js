(function(){
	if(typeof Vile === 'object' && typeof Vile !== 'undefined' && Vile != null){
		Vile.Element = (function(){
			var elementlib = {
				'kv-loadicon-wave': {
					info: '',
					activation: function(){
						Vile.ShadowCaster.custom({
							name: 'kv-loadicon-wave',
							content: function(element){
								var style = "<style>"
								style+= ' div{display:inline-block; padding: 3px 2px;}'
								style+= ' .l{ -webkit-animation: jump 1s ease-out 1s infinite normal; animation: jump 1s ease-out 1s infinite normal; animation-delay: 0.1s;}'
								style+= ' .o{ -webkit-animation: jump 1s ease-out 1s infinite normal; animation: jump 1s ease-out 1s infinite normal; animation-delay: 0.15s;}'
								style+= ' .a{ -webkit-animation: jump 1s ease-out 1s infinite normal; animation: jump 1s ease-out 1s infinite normal; animation-delay: 0.2s;}'
								style+= ' .d{ -webkit-animation: jump 1s ease-out 1s infinite normal; animation: jump 1s ease-out 1s infinite normal; animation-delay: 0.25s;}'
								style+= ' .i{ -webkit-animation: jump 1s ease-out 1s infinite normal; animation: jump 1s ease-out 1s infinite normal; animation-delay: 0.3s;}'
								style+= ' .n{ -webkit-animation: jump 1s ease-out 1s infinite normal; animation: jump 1s ease-out 1s infinite normal; animation-delay: 0.35s;}'
								style+= ' .g{ -webkit-animation: jump 1s ease-out 1s infinite normal; animation: jump 1s ease-out 1s infinite normal; animation-delay: 0.4s;}'
								style+= ' @-webkit-keyframes jump {25%{-webkit-transform: translateY(0);transform: translateY(0);}40%{-webkit-transform: translateY(-5px);transform: translateY(-5px);}50%{-webkit-transform: translateY(0);transform: translateY(0);}}'
								style+= ' @keyframes jump {30%{transform: translateY(0);}40%{transform: translateY(-5px);}50%{transform: translateY(0);}}'
								style+='</style>'
								var content = ""
								content+= "<div class=\"l\">L</div>"
								content+= "<div class=\"o\">O</div>"
								content+= "<div class=\"a\">A</div>"
								content+= "<div class=\"d\">D</div>"
								content+= "<div class=\"i\">I</div>"
								content+= "<div class=\"n\">N</div>"
								content+= "<div class=\"g\">G</div>"

								element.shadow(style+content);
								return "";
							}
						})
					}
				}
			}
			var element = {}
			element.activate = function(activatedElement){
				if(typeof elementlib[activatedElement] !== 'undefined'){
					elementlib[activatedElement].activation()
				}
			}
			element.help = function(activatedElement){
				if(typeof elementlib[activatedElement] !== 'undefined'){
					console.info(elementlib[activatedElement].info)
				}
			}
			return element
		})()
	}
})()