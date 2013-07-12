
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});
server.listen(8080, function() {
	console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
	httpServer: server,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.  You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
		// Make sure we only accept requests from an allowed origin
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	var connection = request.accept();
	console.log((new Date()) + ' Connection accepted.');

	var msg = '{"status": "ok", "messages": [{"type":"unicast","to":"1","from":"2","nick":"Susan","style":"color:red;","body":"Hi.","timestamp":'+((new Date()).getTime())+'},{"type":"multicast","to":"2","from":"2","nick":"Susan","style":"","body":"Someone.","timestamp":'+((new Date()).getTime())+'}], "statuses": [], "presences": [{"from": "3", "to": "1", "type": "offline"}, {"from": "2", "to": "1", "type": "show", "show": "invisible"}, {"from": "5", "to": "1", "type": "online", "show": "away"}]}';

	
	var timer;

	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log('Received Message: ' + message.utf8Data);
			timer = setInterval(function(){
				connection.sendUTF(msg);
			}, 5000);
		}
		else if (message.type === 'binary') {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			//connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function(reasonCode, description) {
		clearInterval( timer );
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});


