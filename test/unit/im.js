module("new");
test("new", function() {
	expect(4);
	var im = new webim();
	stop(6000);
	im.bind("beforeOnline", function(){
		ok(true, "ready");
	});
	im.bind("message", function(e, msg){
		ok(msg, "message");
		im.offline();
	});
	im.bind("online", function(){
		ok(true, "go");
	});
	im.bind("offline", function(){
		ok(true, "stop");
		start();
	});
	im.online();
});
