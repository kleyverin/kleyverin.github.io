if(typeof Vile == "object"){
  Vile.Telepath= {
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
        if(Vile.isElement(element)){
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
