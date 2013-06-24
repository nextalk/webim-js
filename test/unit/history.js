module("history");

test("webim.history - basic method", function() {
	expect( 3 );
	var history = new webim.history(histories, {userInfo: userInfo});
	ok(history.get("unicast", "2"), "has unicast history(id:2)");
	ok(history.get("multicast", "2"), "has multicast history(id:2)");
	ok(!history.get("multicast", "5"), "has not multicast history(id:5)");
});

asyncTest("webim.history - events", function() {
	expect( 5 );
	var history = new webim.history(null, {userInfo: userInfo});
	history.init("unicast", 2, histories["unicast"][2]);
	history.bind("clear", function(e, type, id){
		ok(type == "unicast" && id == 2, "clear history event");
	});
	history.bind("unicast", function(e, id, data){
		ok(id == 2 && history.get("unicast", "2") && history.get("unicast", "2").length, "unicast history event");
	});
	history.bind("multicast", function(e, id, data){
		ok(id == 2 && history.get("multicast", "2") && history.get("multicast", "2").length, "multicast history event");
		start();
	});
	ok(history.get("unicast", "2"), "init history");
	history.clear("unicast", 2);
	ok(history.get("unicast", "2") && !history.get("unicast", "2").length, "clear history");
	history.set( [{"type":"unicast","to":1,"from":2,"style":"","body":"Hi.","timestamp":1246883572400}, {"type":"multicast","to":2, "from": 1, "style":"","body":"People?","timestamp":1246883572400}] );

});

test("webim.history - load", function(){
	expect( 2 );
	stop(2000);
	var history = new webim.history(null, {userInfo: userInfo});
	history.bind("unicast", function(e, id, data){
		ok(id == 2 && history.get("unicast", "2") && history.get("unicast", "2").length, "load unicast history");
	});
	history.bind("multicast", function(e, id, data){
		ok(id == 2 && history.get("multicast", "2") && history.get("multicast", "2").length, "load multicast history");
		start();
	});
	history.load("unicast", 2);
	history.load("multicast", 2);
});
