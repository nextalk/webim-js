module("socket");

test("webim.socket connect", function() {
	expect( 1 );
	stop(2000);
	var socket = new webim.socket( "ws://localhost:8080/" );
	socket.bind("message", function(e, d){
		ok(d, "receive data: " + webim.JSON.stringify(d));
		socket.close();
		start();
	});
});
