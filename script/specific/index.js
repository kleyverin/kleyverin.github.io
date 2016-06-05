Vile.ShadowCaster.custom({
    name: 'kv-clock',
    content: '<div class="hour"></div>:<div class="minute"></div>:<div class="second"></div>',
    callback: {
        onattach: function(){
            var element = this
            function update(){
                element.update();
            }
            setInterval(update,500)
            element.update()
        }
    },
    method: {
        update: function(){
            var hour = this.querySelector('.hour')
            var minute = this.querySelector('.minute')
            var second = this.querySelector('.second')
            var date = new Date();
            var h = Math.round(360*(date.getHours()+(date.getMinutes()/59)+(date.getSeconds()/59/59))/23)
            hour.innerHTML = twoDigit(date.getHours())
            minute.innerHTML = twoDigit(date.getMinutes())
            second.innerHTML = twoDigit(date.getSeconds())
        }
    }
})
Vile.Element.activate('kv-loadicon-wave')

function show(id,value){
    document.getElementById(id).style.display = value ? 'block' : 'none';
}

var page = {};
function twoDigit(number){
    number = String(number)
    if(number.length == 0){
        number = "00"
    }
    else if(number.length == 1){
        number = "0"+number
    }
    else if(number.length > 2){
        number = number.substr(number.length-2)
    }
    return number
}

window.onload = function(){
    Vile.initialize(page)
    page.caster = {}
    show('box-row', true);
    show('loading', false);
}

//MENU
$(function(){
    $('.menu').click(function(){
        $('.container-menu').toggleClass('change');
        $('.menu-item').toggleClass('top');
    });
});

$(document).ready(function(){
    $('.portfolio').hide();
    $('.item-2').click(function(){
        $('.portfolio').show();
        $('.coming-soon').hide();
        $('.what-we-do').hide();
        $('.vile').hide();
    })
});