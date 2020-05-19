window.onload = function(){addEvent(window, 'keydown', keyDown);}

function addEvent(obj, evType, fn){
	if(obj.addEventListener){
		obj.addEventListener(evType, fn, false);
		return true;
	}else if(obj.attachEvent){
		var r = obj.attachEvent("on"+evType, fn);
		return r;
	}
}


function keyDown(e){
	var ev = e||event;
	var key = ev.which||ev.keyCode;
	var esc = 0;

	switch(key){
        case 37: // left
        case 38: // up
        case 39: // right
        case 40: // down
        esc = 1;
        break;
    }
    if(esc && ev.preventDefault){
    	ev.preventDefault();
    }
    return esc;
}