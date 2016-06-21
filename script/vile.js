'use strict'
function ExtendsFrom(classVar){
	var extendor = function(){}
	extendor.prototype = classVar.prototype
	return new extendor();
}
var VileException = function(message = "Error occured", name = "VileException"){
    var tmp = Error.apply(this, arguments)
    tmp.name = this.name = 'VileException'
    this.message = tmp.message = message
    Object.defineProperty(this, 'stack', {
        get: function () {
            return tmp.stack
        }
    })

    return this
}
VileException.prototype = ExtendsFrom(Error)

var Vile = {
	/**********************/
	/*****VileMain*********/
	/**********************/
	isElement: function(obj){
		return obj instanceof HTMLElement
	},
	predefinedConst: {
		'e': true,
		'weaver': true
	},
	preload: function(page){
		page.e = this.VileEditor.makeEditor();
		page.e.quickcord = Vile.Telepath.quickcord;
	},
	initialize: function(page){
		try{
			this.weaveJq(page)
			console.info('Vile detects JQuery. JQuery weaving enabled.')
		}catch(e){
			this.weave(page)
		}
		page.weaver = {
			object : new MutationObserver(function(mutations){
				mutations.forEach(function(mutation){
					mutation.removedNodes.forEach(function(node){
						try{
							if(node.hasAttribute('vile-weave')){
								page[node.getAttribute('vile-weave')] = null
							}
						}catch(e){}
					})
				})
				Vile.reweave(page)
			}),
			off: function(){this.object.disconnect()},
			on: function(){
				this.object.observe(document.body,{
					childList:true,
					subtree: true
				})
			}
		}
		page.weaver.on()
		page = Vile.preload(page)
		//page.f = this.Factory.makeFactory();
		//page.template = this.weaveTemplate()
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
	reweave: function(page){
		//console.info("reweave")
		try{
			this.weaveJq(page)
		}catch(e){
			this.weave(page)
		}
	},
	weave : function(page){
		page = this.validate_page_object(page,"weave");
		var weaver = document.querySelectorAll("*[vile-weave]")
		for(var i = 0; i<weaver.length; i++){
			var weave_name = weaver[i].getAttribute('vile-weave');
			if(weave_name.length > 0 && !this.predefinedConst[weave_name]){
				page[weave_name] = weaver[i]
			}
		}
		return page;
	},
	weaveJq : function(page){
		//console.log(page)
		try{
			if (typeof $ == 'undefined' && !window.jQuery) {  
				throw ""
			}
			page = this.validate_page_object(page,"weave");
			var weaver = document.querySelectorAll("*[vile-weave]")
			for(var i = 0; i<weaver.length; i++){
				var weave_name = weaver[i].getAttribute('vile-weave');
				if(weave_name.length > 0 && !this.predefinedConst[weave_name]){
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
		var templates = document.querySelectorAll("template")
		for(var i = 0; i<templates.length; i++){
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
				if(typeof element != 'string'){
					throw new VileException('first argument must be string')
				}
				if(isObject(attrib) && (!isObject(content) && typeof content != 'function') && typeof content != 'undefined'){
					nAttribute = attrib
					nContent = content
				}
				else if(isObject(content) && (!isObject(attrib) && typeof attrib != 'function') && typeof attrib != 'undefined'){
					nAttribute = content
					nContent = attrib
				}
				else if(!isObject(attrib) && typeof attrib != 'function' && content == null){
					nAttribute = {}
					nContent = attrib
				}
				else if(isObject(attrib) && content == null){
					nAttribute = attrib
					nContent = ''
				}
				else if(typeof content == 'undefined' && typeof attrib == 'undefined'){
					nAttribute = {}
					nContent = ''
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
			editor.nodify = function(html_string){
				var d = document.createElement('div');
				d.innerHTML = html_string;
				return d.firstChild;
			}
			editor.makeNode = function(element,attrib,content){
				return editor.nodify(editor.make(element,attrib,content));
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
				
				var extend = command.extends;
				var elementName = command.name.toLowerCase();
				var content = command.content
				var callback = command.callback
				var method = command.method
				
				//ERROR HANDLER
				
				if((typeof extend !== 'string' && typeof extend !=='undefined') && extend != null){
					throw new VileException("Extend parameter must be string");
				}
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
				var new_element;
				if(!extend){
					new_element = document.registerElement(elementName,{
						prototype: prototype
					})
				}
				else{
					new_element = document.registerElement(elementName,{
						prototype: prototype,
						extends: extend
					})
				}
			}
		}
	})(),
	/*
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
						replacor = String(obj[replaced])
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
				
				console.log(p,positions)
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
	},*/
	/**********************/
	/*****VileComponent****/
	/**********************/
	
	Component : (function(){
		var component = {}
		component.createLoader = function(onload, onfinish){
			if(typeof onload !=='function' || typeof onfinish !=='function'){
				throw new VileException("Page loader needs onload and on finish function");		
			}
			/*
				page.loader = Vile.Component.createLoader(
					function(){
						page.loadIcon.style="opacity:1"
					},
					function(){
						page.loadIcon.style="opacity:0"
					}
				)
				page.load.onclick = function(){
					page.loader.enqueue('a')
					page.loader.enqueue('b')
				}
				page.unload.onclick = function(){
					page.loader.dequeue('a')
					page.loader.dequeue('b')
				}
			*/
			var loader = {
				processes: [],
				get: function(string){
					if(typeof string !== 'string'){
						throw new VileException("Page loader only accept string");
					}
					for(var i = 0; i<this.processes.length; i++){
						if(this.processes[i]==string){
							return i
						}
					}
					return false;
				},
				enqueue: function(string){
					if(typeof string !== 'string'){
						throw new VileException("Page loader only accept string");
					}
					var exists = this.get(string)
					if(exists === false){
						this.processes.push(string)
					}
					this.refresh();
				},
				dequeue: function(string){
					if(typeof string !== 'string'){
						throw new VileException("Page loader only accept string");
					}
					var exists = this.get(string)
					if(exists !== false){
						this.processes.splice(exists,1)
					}
					this.refresh();
				},
				remaining: function(){return this.processes.length},
				refresh: function(){
					if(this.processes.length>0){
						onload()
					}
					else{
						onfinish()
					}
				}
			}
			return loader
		}
		component.createThreader = function(){
			return Vile.Threader
		}
		
		return component
	})(),
	Threader : function(obj){
		if(typeof obj.function !== 'function'){
			throw new VileException('You must pass arguments into VileThread')
		}
		if(typeof obj.arguments !== 'object'){
			obj.arguments = []
		}
		if(typeof obj.success !== 'function'){
			obj.success = function(data){ console.log('data: ',	data) }
		}
		if(typeof obj.error !== 'function'){
			obj.error = function(error){ throw error }
		}

		if(typeof Worker !== 'undefined'){
			function workerMedium(e){
				function assembleArguments(args){
					for(var i in args.prepArgs){
						if(args.argsType[i]=='function'){
							args.prepArgs[i] = Function(args[i].prepParam,args[i].prepFunc)
						}
						else if(args.argsType[i] == 'object'){
							args.prepArgs[i] = assembleArguments(args.prepArgs[i])
						}
					}
					return args.prepArgs
				}
				var data = JSON.parse(e.data)
				var args = assembleArguments({
					prepArgs: data.prepArgs,
					argsType: data.prepParam
				})
				var func = Function(data.prepParam,data.prepFunc)
				
				var ret = {}
				ret.args = args
				ret.debug = data.prepParam
				ret.error = false;
				try{
					ret.result = func.apply(this,args)	
				}catch(e){
					ret.error = e.message
				}
				postMessage(JSON.stringify(ret))
			}

			var bodyExtract = workerMedium.toString();
			var blob = new Blob(['onmessage = '+bodyExtract])
			var url = window.URL.createObjectURL(blob)
			var worker = new Worker(url)
			worker.onmessage = function(e){
				var data = JSON.parse(e.data)
				if(data.error!==false){
					obj.error.apply(this,[data.error])
				}
				else{
					obj.success.apply(this,[data.result])
				}
				worker.terminate()
			}
			//preparefunction
			var disassembledFunction = Vile.Utility.disassembleFunction(obj.function)
			var disassembledArguments = Vile.Utility.disassembleArguments(obj.arguments)
			worker.postMessage(JSON.stringify({
				prepFunc: disassembledFunction.prepFunc,
				prepParam: disassembledFunction.prepParam,
				prepArgs: disassembledArguments.prepArgs,
				argsType: disassembledArguments.argsType
			}))
		}else{
			try{
				obj.success.apply(this,[obj.function.apply(this,obj.arguments)])
			}catch(e){
				obj.error.apply(this,[e.message])
			}
		}
	},
	Utility: {
		disassembleFunction: function(func){
			var prepFunc = func.toString().trim()
			var startArgs = prepFunc.indexOf('(')
			var lastArgs = prepFunc.indexOf(')')
			var prepParam = prepFunc.substring(startArgs+1,lastArgs).replace(' ','').split(',')
			startArgs = prepFunc.indexOf('{')
			lastArgs = prepFunc.lastIndexOf('}')
			prepFunc = prepFunc.substring(startArgs+1,lastArgs).trim();
			return {
				prepFunc: prepFunc,
				prepParam: prepParam
			}
		},
		disassembleArguments: function(args){
			var prepArgs = args
			var argsType = []
			for(var i in prepArgs){
				argsType.push(typeof prepArgs[i])
				if(typeof prepArgs[i] == 'function'){
					prepArgs[i] = this.disassembleFunction(prepArgs[i])
				}
				else if(typeof prepArgs[i] == 'object'){
					prepArgs[i] = this.disassembleArguments(prepArgs[i])
				}
			}
			return {
				prepArgs: prepArgs,
				argsType: argsType
			}
		}
	},
	Telepath: {
		quickcord: function(master=[],slave=[],hardBound=true){
			var cord = new Vile.Telepath.Cord()
			cord.setHardBound(hardBound)
			for(var i in master){
				cord.addMaster(master[i])
			}
			for(var i in slave){
				cord.addSlave(slave[i])
			}
			return cord
		},
		list_master: function(){
			return {
						'INPUT': true,
						'SELECT': true
					}
		},
		cord_transmit: function(value,element){
			if(typeof element.filter === 'function'){
				value = element.filter(value)
			}
			if(typeof value == 'boolean' || typeof value == 'number' || typeof value == 'string'){
				if(element.attribute == null){
					switch(element.element.nodeName.toUpperCase()){
							case 'BUTTON'	: 
							case 'METER'	: 
							case 'PROGRESS'	: 
							case 'TEXTAREA'	: 
							case 'PARAM'	:
							case 'SELECT'	: element.element.value = value; break 
							case 'INPUT'	:
								if(element.element.getAttribute('type')=='checkbox'
								   || element.element.getAttribute('type')=='radio'){
									element.element.checked = value
								}else{
									element.element.value = value; break 
								}
							case 'AREA'		:
							case 'BASE'		:
							case 'BR'		:
							case 'COL'		:
							case 'COMMAND'	:
							case 'EMBED'	:
							case 'HR'		:
							case 'IMG'		:
							case 'KEYGEN'	:
							case 'LINK'		:
							case 'META'		:
							case 'SOURCE'	:
							case 'TRACK'	:
							case 'WBR'		: break;
							default			: element.element.textContent = value; break;
					}
				}else{
					element.element.setAttribute(element.attribute,value)
				}
			}
		},
		cord_receive: function(element,cord){
			if(cord.getCord().lockReceive){
				return
			}
			cord.getCord().lockReceive = true
			if(element.nodeName == 'INPUT'){
				var type = element.getAttribute('type')
				if(type=='radio' || type=='checkbox'){
					cord.set(element.checked) 
					cord.refresh(element)
				}
				else{
					cord.set(element.value) 
					cord.refresh(element)
				}
			}
			else if(element.nodeName == 'SELECT'){
				cord.set(element.value)
				cord.refresh(element)
			}
			cord.getCord().lockReceive = false
		},
		cord_removeMaster: function(element){
			element.onkeyup = null
			element.onchange = null
		},
		cord_bindMaster: function(element,cord){
			element.onkeyup = null
			element.onchange = null
			if(element.nodeName == 'INPUT'){
				var type = element.getAttribute('type')
				if(type=='radio' || type=='checkbox'){
					element.onchange = function(){
						Vile.Telepath.cord_receive(element,cord)
					}
				}
				else{
					if(cord.getCord().hardBound){
						element.onkeyup = function(){
							Vile.Telepath.cord_receive(element,cord)
						}
						element.onchange = function(){
							Vile.Telepath.cord_receive(element,cord)
						}
					}
					else{
						element.onchange = function(){
							Vile.Telepath.cord_receive(element,cord)
						}
					}
				}
			}
			else if(element.nodeName == 'SELECT'){
				element.onchange = function(){
					Vile.Telepath.cord_receive(element,cord)
					cord.getCord().value = element.value
					cord.refresh(element)
				}
			}
		},
		cord_searchElement: function(list,element){
			for(var i = 0; i<list.length; i++){
				if(list[i].element == element){
					return i;
				}
			}
		},
		rebindAllMaster: function(cord){
			var mE = cord.getCord().masterElement
			for(var i = 0; i<mE.length; i++){
				Vile.Telepath.cord_bindMaster(mE[i],this)
			}
		},
		cord_set : function(pub,ref){
			var changed = false;
			var cord = pub.getCord()
			if( ref!=cord.value){
				changed = true
			}
			cord.value = ref;
			
			if(pub.onchangecallback!=null && changed){
				pub.onchangecallback()
			}
			if(pub.onupdatecallback!=null){
				pub.onupdatecallback()
			}
			if(changed){
				pub.refresh()
			}
		},
		Cord: function(){
			var cord = {
				value: null,
				slaveElement: [],
				masterElement: [],
				lockRefresh: false,
				hardBound: false
			};
			var pub = {}
			pub.onchangecallback = null
			pub.onupdatecallback = null
			pub.onchange = function(func){
				if(!(typeof func == 'function' || func == null)){
					throw new VileException('onchange must be function')
				}
				this.onchangecallback = func

			}
			pub.update = function(func){
				if(!(typeof func == 'function' || func == null)){
					throw new VileException('onchange must be function')
				}
				this.onchangecallback = func
			}
			pub.getCord = function(){return cord}
			pub.set = function(ref){
				Vile.Telepath.cord_set(this,ref)
			}
			pub.setHardBound = function(bool){cord.hardBound = bool; Vile.Telepath.rebindAllMaster(this)}
			pub.get = function(){return cord.value}
			pub.addMaster = function(element){
				if(Vile.Telepath.list_master()[element.nodeName]!=true){
					throw new VileException('This HTMLElement cannot be master')
				}
				if(element instanceof HTMLElement){
					cord.masterElement.push({
						element: element
					})
				}else{
					throw new VileException('The first parameter must be an HTMLElement')
				}
				Vile.Telepath.cord_transmit(cord.value,cord.masterElement[cord.masterElement.length-1])
				Vile.Telepath.cord_bindMaster(element,this)
			}
			pub.removeMaster = function(element){
				if(!Vile.isElement(element)){
					throw new VileException('The first parameter must be an HTMLElement')
				}
				cord.masterElement.splice(Vile.Telepath.cord_searchElement(cord.masterElement,element),1)
				Vile.Telepath.cord_removeMaster(element)
			}
			pub.addSlave = function(element,attribute){
				if(Vile.isElement(element)){
					cord.slaveElement.push({
						element: element,
						attribute: attribute
					})
				}else{
					throw new VileException('The first parameter must be an HTMLElement')
				}
				Vile.Telepath.cord_transmit(cord.value,cord.slaveElement[cord.slaveElement.length-1])
			}
			pub.removeSlave = function(element){
				if(!Vile.isElement(element)){
					throw new VileException('The first parameter must be an HTMLElement')
				}
				cord.slaveElement.splice(Vile.Telepath.cord_searchElement(cord.slaveElement,element),1)
			}
			pub.setSlaveFilter = function(element,filter){
				if(typeof filter !== 'function'){
					throw new VileException('Filter must be function that returns string which is an altered parameter')
				}
				if(!Vile.isElement(element)){
					throw new VileException('The first parameter must be an HTMLElement')
				}
				var index = Vile.Telepath.cord_searchElement(cord.slaveElement,element)
				cord.slaveElement[index].filter = filter
				Vile.Telepath.cord_transmit(cord.value,cord.slaveElement[index])
			}
			pub.removeSlaveFilter = function(element){
				if(!Vile.isElement(element)){
					throw new VileException('The first parameter must be an HTMLElement')
				}
				cord.slaveElement[Vile.Telepath.cord_searchElement(cord.slaveElement,element)].filter = null
				Vile.Telepath.cord_transmit(cord.value,element)
			}
			pub.setSlaveAttribute = function(element,attribute){
				if(!Vile.isElement(element)){
					throw new VileException('The first parameter must be an HTMLElement')
				}
				if(typeof attribute != 'string'){
					throw new VileException('Attribute must be string')
				}
				var index = Vile.Telepath.cord_searchElement(cord.slaveElement,element)
				cord.slaveElement[index].attribute = attribute
				Vile.Telepath.cord_transmit(cord.value,cord.slaveElement[index])
			}
			pub.removeSlaveAttribute = function(element){
				if(!Vile.isElement(element)){
					throw new VileException('The first parameter must be an HTMLElement')
				}
				cord.slaveElement[Vile.Telepath.cord_searchElement(cord.slaveElement,element)].attribute = null
				Vile.Telepath.cord_transmit(cord.value,element)
			}
			pub.refresh = function(exception){
				if(cord.lockRefresh){
					return
				}
				cord.lockRefresh = true
				for(var i = 0; i<cord.masterElement.length; i++){
					if(cord.masterElement[i].element!=exception){
						Vile.Telepath.cord_transmit(cord.value,cord.masterElement[i])
					}
				}
				for(var i = 0; i<cord.slaveElement.length; i++){
					Vile.Telepath.cord_transmit(cord.value,cord.slaveElement[i])
				}
				cord.lockRefresh = false
			}
			return pub
		}
	}
}