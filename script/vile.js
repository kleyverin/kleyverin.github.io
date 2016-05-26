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
		if(typeof page !== 'object' && typeof page !== 'undefined'){
			var message = "Cannot "+(action != null ? action : "process")+" non-object and non-null"
			throw new VileException(message);
		}
		else if(page === null || typeof page == 'undefined'){
			page = {};
		}
		return page
	},
	isAlpha : function(str){
		return str.match(/[a-z]/i)
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
			editor.make = function(element,attrib,content){
				var nAttribute;
				var nContent;
				
				if(isObject(attrib) && typeof content == 'string'){
					nAttribute = attrib
					nContent = content
				}
				else if(isObject(content) && typeof attrib == 'string'){
					nAttribute = content
					nContent = attrib
				}
				else{
					throw new VileException("Invalid parameters. editor.make parameters should be element(string),content(string),attrib(object) or element(string),attrib(object),content(string)");
				}
				
				if(list_void[element]!=true){
					return editor.makeE(element,nContent,nAttribute);
				}
				else{
					return editor.makeVoid(element,nAttribute);
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
			cast: function(element){
				var shadow = this.createShadowRoot();
				return shadow;
			},
			custom: function(command){
				Vile.validate_page_object(command)
				
				var elementName = command.name.toLowerCase();
				var content = command.content
				var lifecycle = command.lifecycle
				var method = command.method
				
				//ERROR HANDLER
				if(!elementName.includes('-')){
					throw new VileException("ShadowCast needs name with '-' in it, such as 'foo-bar' or 'my-phone-number'");
				}
				if(!Vile.isAlpha(elementName[0]) || !Vile.isAlpha(elementName[elementName.length - 1])){
					throw new VileException("ShadowCast needs name must start and end with alphabetic character");
				}
				if(typeof content != 'function' && typeof content != 'string'){
					content = function(element){
						return element.innerHTML
					}
				}
				lifecycle = Vile.validate_page_object(lifecycle)
				method = Vile.validate_page_object(method)
				
				var prototype = Object.create(HTMLElement.prototype)
				for(var key in method){
					prototype[key] = method[key]
				}
				prototype.shadow = function(set){
					if(set == null){
						
						if(this.shadowElement==null){
							this.shadowElement = this.createShadowRoot();
						}
						return this.shadowElement;
					
					}else if(typeof set == 'string'){
						
						if(this.shadowElement==null){
							this.shadowElement = this.createShadowRoot();
						}
						this.shadowElement.innerHTML = set
					}
				}
				prototype.refresh = function(){
					if(typeof content == 'function'){
						this.innerHTML = content(this)
					}
					else if(typeof content == 'string'){
						this.innerHTML = content
					}
				}
				
				//ATTACHING LIFECYCLE
				if(typeof lifecycle.created == 'function'){
					prototype.createdCallback = lifecycle.created
				}
				if(typeof lifecycle.attached == 'function'){
					prototype.attachedCallback = lifecycle.attached
				}
				if(typeof lifecycle.detached == 'function'){
					prototype.detachedCallback = lifecycle.detached
				}
				
				//RENDERING THE ELEMENT'S CHILD
				if(!prototype.attachedCallback){
					prototype.attachedCallback = prototype.refresh
				}
				if(!prototype.createdCallback){
					prototype.createdCallback = prototype.refresh
				}
				var new_element = document.registerElement(elementName,{
					prototype: prototype
				})
			}
		}
	})()
	
	
	
	
	
	/**********************/
	/*****VileLoading******/
	/**********************/
}