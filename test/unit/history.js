module("history");

test("webim.history - basic method", function() {
	expect( 3 );
	var history = new webim.history(histories, {userInfo: userInfo});
	ok(history.get("chat", "2"), "has chat history(id:2)");
	ok(history.get("grpchat", "2"), "has grpchat history(id:2)");
	ok(!history.get("grpchat", "5"), "has not grpchat history(id:5)");
});

asyncTest("webim.history - events", function() {
	expect( 5 );
	var history = new webim.history(null, {userInfo: userInfo});
	history.init("chat", 2, histories["chat"][2]);
	history.bind("clear", function(e, type, id){
		ok(type == "chat" && id == 2, "clear history event");
	});
	history.bind("chat", function(e, id, data){
		ok(id == 2 && history.get("chat", "2") && history.get("chat", "2").length, "chat history event");
	});
	history.bind("grpchat", function(e, id, data){
		ok(id == 2 && history.get("grpchat", "2") && history.get("grpchat", "2").length, "grpchat history event");
		start();
	});
	ok(history.get("chat", "2"), "init history");
	history.clear("chat", 2);
	ok(history.get("chat", "2") && !history.get("chat", "2").length, "clear history");
	history.set( [{"type":"chat","to":1,"from":2,"style":"","body":"Hi.","timestamp":1246883572400}, {"type":"grpchat","to":2, "from": 1, "style":"","body":"People?","timestamp":1246883572400}] );

});

test("webim.history - load", function(){
	expect( 2 );
	stop(2000);
	var history = new webim.history(null, {userInfo: userInfo});
	history.bind("chat", function(e, id, data){
		ok(id == 2 && history.get("chat", "2") && history.get("chat", "2").length, "load chat history");
	});
	history.bind("grpchat", function(e, id, data){
		ok(id == 2 && history.get("grpchat", "2") && history.get("grpchat", "2").length, "load grpchat history");
		start();
	});
	history.load("chat", 2);
	history.load("grpchat", 2);
});
