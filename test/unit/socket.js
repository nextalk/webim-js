module("socket");

test("webim.socket connect", function() {
	expect( 1 );
	stop(6000);
	var socket = new webim.socket( "ws://localhost:8080/", {domain: "local", ticket: "root"} );
	socket.bind("message", function(e, d){
		//console.log( d );
		ok(d, "receive data: " + webim.JSON.stringify(d));
		socket.close();
		start();
	});
});
