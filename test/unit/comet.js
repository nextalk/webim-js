module("comet");

test("webim.comet connect", function() {
	expect( 1 );
	stop(6000);
	var comet = new webim.comet( _path + "data/packets.php" );
	comet.bind("message", function(e, d){
		ok(d, "receive data: " + webim.JSON.stringify(d));
		comet.close();
		start();
	});
});
