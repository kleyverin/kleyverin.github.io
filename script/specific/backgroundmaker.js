function Color(){
	var self = this
	this.hsl = false;
	this.r = 255
	this.g = 255
	this.b = 255
	this.h = 0
	this.s = 0
	this.l = 100
	this.a = 1
	this.refreshHSL = function(){
		var newConf = rgbToHsl(r,g,b);
		self.h = newConf.h
		self.s = newConf.s
		self.l = newConf.l
	}
	this.refreshRGB = function(){
		var newConf = hslToRgb(h,s,l)
		self.r = newConf.r
		self.g = newConf.g
		self.b = newConf.b
	}
}
function hslToRgb(h,s,l){
	var ret = {}
	var c = (1-Math.abs((2*l/100-1)))*(s/100)
	var x = c * (1-Math.abs(((h/60)%2)-1))
	var m = l/100-c/2
	var r,g,b;
	if	   (  0<=h && h<60 ){ r=c ; g=x ; b=0 ;}
	else if( 60<=h && h<60 ){ r=x ; g=c ; b=0 ;}
	else if(120<=h && h<180){ r=0 ; g=c ; b=x ;}
	else if(180<=h && h<240){ r=0 ; g=x ; b=c ;}
	else if(240<=h && h<300){ r=x ; g=0 ; b=c ;}
	else if(300<=h && h<360){ r=c ; g=0 ; b=x ;}
	ret.r = Math.round((r+m)*255)
	ret.g = Math.round((g+m)*255)
	ret.b = Math.round((b+m)*255)
	return ret
}
function rgbToHsl(r,g,b){
	var ret = {}
	ret.h;ret.s;ret.l;
	var min = 100, max = 0
	r=r/255*100
	g=g/255*100
	b=b/255*100
	if(r<min){min = r}
	if(g<min){min = g}
	if(b<min){min = b}
	if(r>max){max = r}
	if(g>max){max = g}
	if(b>max){max = b}
	console.log(max-min)
	//l
	ret.l = (max+min)/2
	//s
	if(max-min == 0){ret.s = 0}
	else{ret.s = (max-min)/(1-Math.abs((2*ret.l)/100-1))}
	//h
	if(max-min==0){ret.h = 0}
	else if(max==r){ ret.h = 60 * (((g-b)/(max-min))%6) }
	else if(max==g){ ret.h = 60 * (((b-r)/(max-min))+2) }
	else if(max==b){ ret.h = 60 * (((r-g)/(max-min))+4) }
	return ret
}
function decimalToHex(number){
	function toHex(numbers){
		if(numbers < 10){
			return numbers
		}
		else{
			switch(numbers){
				case 10: return 'A'
				case 11: return 'B'
				case 12: return 'C'
				case 13: return 'D'
				case 14: return 'E'
				case 15: return 'F'
				default: throw new VileException('Invalid number')
			}
		}
	}
	var string = ""
	while(true){
		if(number==0){
			break
		}
		string = toHex(number%16)+string
		number = Math.floor(number/16)
	}
	return string;
}
function hexToDecimal(string){
	string = String(string)
	function toDecimal(char){
		switch(char.toUpperCase()){
			case 'A': return 10
			case 'B': return 11
			case 'C': return 12
			case 'D': return 13
			case 'E': return 14
			case 'F': return 15
			default: 
				try{
					return Number(char)
				}catch(e){
					throw new VileException('Invalid char')
				}
		}
	}
	var number = 0;
	var pow = 1;
	var p = string.length-1
	while(true){
		console.log(p)
		if(p<0){
			break;
		}
		number += pow*toDecimal(string[p])
		pow *= 16
		p-=1
	}
	return number;
}
function rgbToHex(r,g,b){
	return (('00')+decimalToHex(r)).slice(-2)
		+(('00')+decimalToHex(g)).slice(-2)
		+(('00')+decimalToHex(b)).slice(-2)
}
function hexToRgb(string){
	if(string.length == 6){
		return {
			r: hexToDecimal(string[0]+string[1]),
			g: hexToDecimal(string[2]+string[3]),
			b: hexToDecimal(string[4]+string[5])
		}
	}
	else if(string.length == 3){
		return {
			r: hexToDecimal(string[0])*16,
			g: hexToDecimal(string[1])*16,
			b: hexToDecimal(string[2])*16
		}
	}
	else{
		throw "Hex invalid";
	}
}
function codifyColor(colors){
	var color = colors.color
	if(color.hsl){
		return "hsla("+color.h+","+color.s+","+color.l+","+color.a+")"
	}
	else{
		return "rgba("+color.r+","+color.g+","+color.b+","+color.a+")"
	}
}
function codifyLayer(layer){
	var attribute = ""
	if(layer.linear){attribute += "linear-gradient( "}
	else{attribute += "radial-gradient( "}
	for(var i = 0; i < layer.colors.length; i++){
		if(i!=0){
			attribute+=" , "
		}
		attribute+=codifyColor(layer.colors[i])
		attribute+=" "+(layer.colors[i].position*100)+"%"
	}
	attribute+= " )"
	return attribute
}
function codifyLayers(){
	var attributes = ""
	for(var i = 0; i<page.layers.length; i++){
		attributes+=" "+codifyLayer(page.layers[i])
	}
	return attributes
}
var page = {}
/******
layer management
*****/
var selectedLayer;
page.modifyLayer = function(event,element){
	var attribute = $(element).attr('data-attr')
	var index = $(element).parents('.layer-item').attr('data-index')
	page.layers[index][attribute] = $(element).val()
}
page.selectLayer = function(event,element){
	var selected = $(element).parents('.layer-item')
	if(!selected.hasClass('active')){
		$(page.listLayer).children('.layer-item').removeClass('active')
		var index = $(element).parents('.layer-item').attr('data-index')
		selectedLayer = page.layers[index]
		selected.addClass('active')
	}else{
		page.unselectLayer()
	}
	page.layerOption.refresh()
}
page.unselectLayer = function(){
	$(page.listLayer).children('.layer-item').removeClass('active')
	selectedLayer = null
	page.layerOption.refresh()
}
page.layerOption = {}
page.layerOption.changeGradientMode = function(event,element){
	if(element.value=='linear'){
		selectedLayer.linear = true;
	}
	else if(element.value=='radial'){
		selectedLayer.linear = false;
	}
	page.layerOption.refreshModeSpecific()
}
page.layerOption.refreshGradientMode = function(){
	$(page.gradientMode).children('option').removeAttr('selected')
	if(selectedLayer.linear){
		$(page.gradientMode).children('option[value="linear"]').prop('selected',true)
	}else{
		$(page.gradientMode).children('option[value="radial"]').prop('selected',true)
	}
}
page.layerOption.refresh = function(){
	if(selectedLayer){
		var layerOption = $(page.sectionLayerOption)
		layerOption.removeClass('hidden')
		layerOption.children('label:first-child').text(selectedLayer.name)

		page.layerOption.refreshGradientMode();

		page.layerOption.refreshModeSpecific()
		
		page.layerOption.colorGraph.refresh()
	}
	else{
		$(page.sectionLayerOption).addClass('hidden')
	}
}
page.layerOption.refreshModeSpecific = function(){
	if(selectedLayer.linear){
		$('.linear-only').show();
		$('.radial-only').hide();
		page.layerOption.angleSetting.refresh()
	}
	else{
		$('.radial-only').show();
		$('.linear-only').hide();
		page.layerOption.shapeSetting.refresh()
		page.layerOption.positionSetting.refresh()
	}
}
page.layerOption.angleSetting = {}
page.layerOption.angleSetting.up = function(){
	var angle = $(page.inputAngleSetting).val()
	angle++;
	if(angle>359){
		angle = angle%360
	}
	selectedLayer.angle = angle;
	$(page.inputAngleSetting).val(angle)
}
page.layerOption.angleSetting.down = function(){
	var angle = $(page.inputAngleSetting).val()
	angle--;
	while(angle<0){
		angle+=360
	}
	selectedLayer.angle = angle;
	$(page.inputAngleSetting).val(angle)
}
page.layerOption.angleSetting.update = function(){
	selectedLayer.angle = $(page.inputAngleSetting).val()
}
page.layerOption.angleSetting.refresh = function(){
	$(page.inputAngleSetting).val(selectedLayer.angle)
}
page.layerOption.shapeSetting={}
page.layerOption.shapeSetting.update = function(event, element){
	selectedLayer.shape = $(element).val()
}
page.layerOption.shapeSetting.refresh = function(){
	$(page.shapeMode).children('option').removeAttr('selected')
	if(selectedLayer.shape == "ellipse"){
		$(page.shapeMode).children('option[value="ellipse"]').prop('selected',true)
	}else{
		$(page.shapeMode).children('option[value="circle"]').prop('selected',true)
	}
}
page.layerOption.positionSetting = {}
page.layerOption.positionSetting.up = {
	X:function(){
		var x = $(page.inputPositionXSetting).val()
		x++;
		if(x>100){
			x = 100
		}
		selectedLayer.position.x = x;
		$(page.inputPositionXSetting).val(x)
	},
	Y:function(){
		var y = $(page.inputPositionYSetting).val()
		y++;
		if(y>100){
			y = 100
		}
		selectedLayer.position.y = y;
		$(page.inputPositionYSetting).val(y)

	}
}
page.layerOption.positionSetting.down = {
	X:function(){
		var x = $(page.inputPositionXSetting).val()
		x--;
		if(x<0){
			x=0
		}
		selectedLayer.position.x = x;
		$(page.inputPositionXSetting).val(x)
	},
	Y:function(){
		var y = $(page.inputPositionYSetting).val()
		y--;
		if(y<0){
			y=0
		}
		selectedLayer.position.y = y;
		$(page.inputPositionYSetting).val(y)
	}
}
page.layerOption.positionSetting.update = function(){
	selectedLayer.position.x = $(page.inputPositionXSetting).val()
	selectedLayer.position.y = $(page.inputPositionYSetting).val()
}
page.layerOption.positionSetting.refresh = function(){
	$(page.inputPositionXSetting).val(selectedLayer.position.x)
	$(page.inputPositionYSetting).val(selectedLayer.position.y)
}
page.layerOption.colorGraph={}
page.layerOption.colorGraph.selectColor = function(event, element){
	if(selectedPeon==null){
		selectedPeon = element
		$(selectedPeon).addClass('active')
		draggedPeon = element
	}else{
		$(selectedPeon).removeClass('active')
		selectedPeon = null
	}
}
window.addEventListener('mouseup',function(e){
	if(draggedPeon!=null){
		draggedPeon = null
	}
})
window.addEventListener('mousemove',function(e){
	if(draggedPeon!=null){
		var left = ((e.pageX - (draggedPeon.offsetWidth/2) - page.colorGraph.getBoundingClientRect().left)/(page.colorGraph.offsetWidth-12)*100);
		if(left>100){
			left=100
		}
		else if(left<0){
			left=0
		}
		selectedLayer.colors[$(draggedPeon).attr('data-index')].position = left;
		$(draggedPeon).css('left',left+"%") 
	}
})
page.layerOption.colorGraph.makePeon = function(color,index){
	var inside = page.e.make('div',{
		'data-index': index,
		onmousedown: "page.layerOption.colorGraph.selectColor(event,this)",
		style: page.e.generateAttributesForStyle({
			background: codifyColor(color),
			left: color.position+"%"
		})
	})
	var outside = page.e.make('div',{
		class:'peon'
	},inside)
	return outside
}
page.layerOption.colorGraph.refreshRuler = function(){
	page.colorRuler.style="background:"+codifyLayer(selectedLayer)
}
page.layerOption.colorGraph.refresh = function(){
	page.layerOption.colorGraph.refreshRuler()
	var colorPeons = ""
	for(var i = 0; i<selectedLayer.colors.length; i++){
		colorPeons+=page.layerOption.colorGraph.makePeon(selectedLayer.colors[i],i)
	}
	$(page.colorGraph).html(colorPeons)
}
var selectedPeon = null
var draggedPeon = null

page.layerCount = 0
page.layers = []
/******
document ready
*****/
$(document).ready(function(){
	Vile.initialize(page)
	page.toggleCodePanel = function(){
		$('.code-panel').toggleClass('active')
	}
	page.deleteLayer = function(event,element){
		var index = $(element).parents('.layer-item').attr('data-index')
		if(selectedLayer == page.layers.splice(index,1)[0]){
			page.unselectLayer()
		}
		page.refreshLayers();
	}
	page.refreshLayers = function(){
		var layerItems = ""
		for(var i = 0 ; i < page.layers.length; i++){
			var display = page.e.make('div',{
				class:'layer-display',
				'onclick':'page.selectLayer(event,this)',
				style: 'background: '+codifyLayer(page.layers[i])+";"
			},'')
			var title = page.e.make('div',
									{class:'layer-title'},
									page.e.make('input',{'data-attr':'name',value:page.layers[i].name,type:'text',onchange:'page.modifyLayer(event,this)'},''))
			var del = page.e.make('a',{class:'layer-delete','onclick':'page.deleteLayer(event,this)'},page.e.make('span',{class:'glyphicon glyphicon-remove'}))
			var item
			if(page.layers[i] == selectedLayer){
				item = page.e.make('div',{'data-index':i,class:'layer-item active'},display+title+del)
			}else{
				item = page.e.make('div',{'data-index':i,class:'layer-item'},display+title+del)
			}

			layerItems+=item	
		}
		$(page.listLayer).html(layerItems)
	}
	page.addLayer = function(){
		page.layers.push({
			//mode, if linear == false than it is radial gradient
			name: 'layer '+(++page.layerCount),
			linear: true,
			colors: [{position: 0,color:new Color()},{position:100,color:new Color()}],
			angle: 0,
			shape: "circle",
			position:{
				x: 50,
				y: 50
			}
		})
		page.refreshLayers();
	}
})