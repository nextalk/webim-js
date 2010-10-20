//log
//log.enable();
//log.disable();
//log(log,method);
var _logable = true;
function log(str, method){
	if (!_logable) 
		return;
	var d = new Date(),  time = ['[', d.getHours(), ':', d.getMinutes(), ':', d.getSeconds(), '-', d.getMilliseconds(), ']'].join(""), msg = time + method + JSON.stringify(str);
	window.console && window.console.log(time, method, str); 
	//cosole.log("%s: %o",msg,this);
	var log = document.getElementById("webim-log");
	if ( window.runtime && window.air ) {
		window.air.trace( msg ); //air
		window.air.Introspector && window.air.Introspector.Console.log( msg );
	}
	if ( log ) { 
		var m = document.createElement("P");
		m.innerHTML = msg;
		log.appendChild(m);
	}
	//log.scrollTop(log.get(0).scrollHeight);
}
log.enable = function(){
	_logable = true;
};
log.disable = function(){
	_logable = false;
};
