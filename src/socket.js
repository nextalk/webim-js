/*
 * websocket
 */


function socket( url, options ) {
	var self = this, options = options || {};
	var ws = self.ws = new WebSocket( url );
	ws.onopen = function ( e ) { 
		self.trigger( 'open', 'success' );
		ws.send("subscribe " + options.domain + " " + options.ticket );
	}; 
	ws.onclose = function ( e ) { 
		self.trigger( 'close', [ e.data ] );
	}; 
	ws.onmessage = function ( e ) { 
		var data = e.data;

		try{
			data = data ?
				( window.JSON && window.JSON.parse ?
				window.JSON.parse( data ) :
				(new Function("return " + data))() ) :
				data;
		}catch(e){};

		self.trigger( 'message', [ data ] );
	}; 
	ws.onerror = function ( e ) { 
		self.trigger( 'error', [ ] );
	}; 
}

socket.prototype = {
	readyState: 0,
	send: function( data ) {
	},
	close: function() {
		this.ws.close();
	}
};

socket.enable = !!window.WebSocket;

//The connection has not yet been established.
socket.CONNECTING = 0;

//The connection is established and communication is possible.
socket.OPEN = 1;

//The connection has been closed or could not be opened.
socket.CLOSED = 2;

//Make the class work with custom events
ClassEvent.on( socket );


