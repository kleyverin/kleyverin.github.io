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
		page.e = this.VileEditor.makeEditor();
		page.f = this.Factory.makeFactory();
		page.template = this.weaveTemplate()
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
	
	
	//ESCAPE UNESCAPE BY http://shebang.brandonmintern.com/
	escape:function(str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	},
	unescape:function(escapedStr) {
		var div = document.createElement('div');
		div.innerHTML = escapedStr;
		var child = div.childNodes[0];
		return child ? child.nodeValue : '';
	},
	unescapeTemplate:function(escapedStr){
		return escapedStr
         .replace("&amp;","&")
         .replace("&lt;","<")
         .replace("&gt;",">")
         .replace("&quot;","\"")
         .replace("&#039;","'");
	},
	
	
	
	
	
	/**********************/
	/*****ElementWeave*****/
	/**********************/
	weave : function(page){
		page = this.validate_page_object(page,"weave");
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
			page = this.validate_page_object(page,"weave");
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
	weaveTemplate : function(page){
		page = this.validate_page_object(page,"weave templates");
		let templates = document.querySelectorAll("template")
		for(let i = 0; i<templates.length; i++){
			if(templates[i].hasAttribute('id')){
				var template_name = templates[i].getAttribute('id');
				if(template_name.length > 0){
					page[template_name] = templates[i].innerHTML.trim()
				}
			}
		}
		return page;
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
				command = Vile.validate_page_object(command)
				
				var elementName = command.name.toLowerCase();
				var content = command.content
				var callback = command.callback
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
				callback = Vile.validate_page_object(callback)
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
				
				//ATTACHING callback
				if(typeof callback.oncreate == 'function'){
					prototype.createdCallback = callback.oncreate
				}
				if(typeof callback.onattach == 'function'){
					prototype.attachedCallback = callback.onattach
				}
				if(typeof callback.ondetach == 'function'){
					prototype.detachedCallback = callback.ondetach
				}
				if(typeof callback.onattributechange == 'function'){
					prototype.attributeChangedCallback = callback.onattributechange
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
	})(),
	
	Factory : {
		mold: function(template,obj){
			if(typeof template !== 'string'){
				throw new VileException("Template must be string");
			}
			obj = Vile.validate_page_object(obj)
			//------------------
			function searchTag(p){
				var start = template.indexOf('&lt;%=',p)
				var startEscape = template.indexOf('&lt;%-',p)
				var escape = false;
				//search for start tag
				if(startEscape<start && startEscape>=0){
					start = startEscape
					escape = true
				}
				
				//search for end tag
				var end = template.indexOf('%&gt;',start+6)
				
				//checking if the next start tag is valid or not
				var nextStart = template.indexOf('&lt;%=',start+6)
				var nextStartEscape = template.indexOf('&lt;%-',start+6)
				if(nextStartEscape<nextStart && nextStartEscape>=0){
					nextStart = nextStartEscape
				}
				
				if(end>nextStart && nextStart>=0){
					end = -1
				}
				
				return {
					start: start,
					end: end,
					escape: escape
				}
			}
			//-------------------------
			function moldTag(positions){
				var replaced = template.substr(positions.start+6,(positions.end-1)-(positions.start+6)).trim()
				var replacor = ""
				if(replaced.length!=0){
					if(typeof (obj[replaced]) != 'undefined'){
						replacor = obj[replaced]
					}
					if(positions.escape){
						replacor = Vile.escape(replacor)
					}
				}
				
				template = template.substr(0,positions.start) + replacor + template.substr(positions.end+5)
				
				return replacor
			}
			
			//---------------------
			//Start iterating through the template
			var p = 0;
			while(p<template.length){
				var positions = searchTag(p)
				
				//NO OPENING TAGS FOUND
				if(positions.start == -1){
					break;
				}
				else if(positions.start >= 0 && positions.end == -1){
					throw new VileException('There\'s an error in the given template.')
				}
				
				p=positions.start
				var replacor = moldTag(positions)
				p+=replacor.length;
				p++
			}
			return template
		},
		moldMany: function(template,array){
			var html = ""
			for(var i = 0; i<array.length; i++){
				html+=this.mold(template,array[i])
			}
			return html
		},
		moldArray: function(template,array){
			var array = []
			for(var i = 0; i<array.length; i++){
				array.push(this.mold(template,array[i]))
			}
			return array
		},
		makeFactory: function(obj = {}){
			for(var key in this){
				obj[key] = this[key]
			}
			return obj
		}
	}
	/**********************/
	/*****VileLoading******/
	/**********************/
}