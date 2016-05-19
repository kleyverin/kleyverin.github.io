'use strict'
function VileException(message = "Error occured", name = "VileException"){
	this.name = name
	this.message = message
    this.level =       "Show Stopper"
    this.htmlMessage = message
    this.toString =    function(){return this.name + ": " + this.message;}
}
var Vile = {
	/**********************/
	/*****VileMain*********/
	/**********************/
	initialize: function(page){
		this.weave(page)
		page.e = this.VileEditor.makeEditor()
	},
	list_attr_previxes : [
		"vile-weave"
	],
	validate_page_object: function(page,action){
		if(typeof page !== 'object'){
			var message = "Cannot "+(action != null ? action : "process")+" non-object and non-null"
			throw new VileException(message);
		}
		else if(page === null){
			page = {};
		}
	},
	
	
	
	
	
	/**********************/
	/*****ElementWeave*****/
	/**********************/
	weave : function(page){
		this.validate_page_object(page,"weave");
		let weaver = document.querySelectorAll("*[vile-weave]")
		for(let i = 0; i<weaver.length; i++){
			var weave_name = weaver[i].getAttribute('vile-weave');
			if(weave_name.length > 0){
				page[weave_name] = weaver[i]
			}
		}
		return page;
	},
	weaveJq : function(page){
		try{
			if (typeof $ == 'undefined' || !window.jQuery) {  
				throw ""
			}
			this.validate_page_object(page,"weave");
			let weaver = document.querySelectorAll("*[vile-weave]")
			for(let i = 0; i<weaver.length; i++){
				var weave_name = weaver[i].getAttribute('vile-weave');
				if(weave_name.length > 0){
					page[weave_name] = $(weaver[i])
				}
			}
			return page;
		}
		catch(e){
			throw new VileException('JQuery is not loaded')
		}
	},
	
	
	
	
	
	/**********************/
	/*****VileEditors******/
	/**********************/
	VileEditor:{
		makeEditor : function(editor = {}){
			var list_void = {
				'area':true,
				'base':true,
				'br':true,
				'col':true,
				'command':true,
				'embed':true,
				'hr':true,
				'img':true,
				'input':true,
				'keygen':true,
				'link':true,
				'meta':true,
				'param':true,
				'source':true,
				'track':true,
				'wbr':true
			}
			var isObject = function(obj){
				return typeof obj === "object" && obj !== null;
			}
			var entityMap = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': '&quot;',
				"'": '&#39;',
				"/": '&#x2F;'
			};

			editor.esc = function(string) {
				return String(string).replace(/[&<>"'\/]/g, function (s) {
				return entityMap[s];
				});
			}
			editor.makeVoid = function(element,attrib){
				if(list_void[element]!=true){
					return editor.makeE(element,'',attrib);
				}
				
				var attributes = editor.generateAttributes(attrib)
				return "<"+element+attributes+">";
			}
			editor.makeE = function(element,content,attrib){
				if(list_void[element]==true){
					return editor.makeVoid(element,attrib);
				}
				var attributes = editor.generateAttributes(attrib)
				return "<"+element+attributes+">"+content+"</"+element+">";
			}
			editor.make = function(element,content,attrib){
				if(list_void[element]!=true){
					return editor.makeE(element,'',attrib);
				}
				else{
					return editor.makeVoid(element,attrib);
				}
			}
			editor.makeStyle = function(element,attrib){
				return element+'{'+editor.generateAttributesForStyle(attrib)+'}'
			}
			editor.generateAttributesForStyle = function(attrib){
				var attributes = ""
				for(var key in attrib){
					attributes+=key+":"+attrib[key]+";"
				}
				console.log(attributes)
				return attributes;
			}
			editor.generateAttributes = function(attrib){
				if(!isObject(attrib)){
					attrib = {};
				}
				var attributes = ""
				for(var key in attrib){
					attributes+= " "+key;
					if(attrib[key]!==true){
						attributes+='="'+attrib[key]+'"'
					}
				}
				return attributes
			}
			return editor
		}
	},
	
	
	
	
	/**********************/
	/*****ShadowCaster*****/
	/**********************/
	ShadowCaster : (function(){
		return {
			cast: function(elementName, content = function(element){ return element.innerHTML }, style = {}, proto = {}, attrib = {}){
				//CHECKING ELEMENT NAME
				Vile.validate_page_object(attrib)
				if(!elementName.includes('-')){
					throw new VileException("ShadowCast needs name with '-' in it, such as 'foo-bar' or 'my-phone-number'");
				}
				
				var prototype = Object.create(HTMLElement.prototype, proto)
				
				//RENDERING THE ELEMENT'S CHILD
				if(!prototype.attachedCallback){
					prototype.attachedCallback = function(){
						var shadow = this.createShadowRoot();
						shadow.innerHTML = "<style>"+style+"</style>"+content(this)
					}
				}
				
				var new_element = document.registerElement(elementName,{
					prototype: prototype
				})
				
				for(var key in attrib){
					new_element.key = attrib[key]
				}
				
			}
		}
	})()
	
	
	
	
	
	/**********************/
	/*****VileLoading******/
	/**********************/
}