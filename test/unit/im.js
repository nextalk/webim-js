module("new");
test("new jsonpd connection", function() {
	expect(7);
	var im = new webim(null, {connectionType:"jsonpd"});
	stop(6000);
	im.bind("beforeOnline", function(){
		ok(true, "ready");
		ok(im.state === webim.BEFOREONLINE, "state BEFOREONLINE");
	});
	im.bind("message", function(e, msg){
		ok(msg, "message");
		im.offline();
	});
	im.bind("online", function(){
		ok(im.state === webim.ONLINE, "state ONLINE");
		ok(true, "go");
	});
	im.bind("offline", function(){
		ok(im.state === webim.OFFLINE, "state OFFLINE");
		ok(true, "stop");
		start();
	});
	im.online();
});

test("new auto connection", function() {
	expect(7);
	var im = new webim(null);
	stop(6000);
	im.bind("beforeOnline", function(){
		ok(true, "ready");
		ok(im.state === webim.BEFOREONLINE, "state BEFOREONLINE");
	});
	im.bind("message", function(e, msg){
		ok(msg, "message");
		im.offline();
	});
	im.bind("online", function(){
		ok(im.state === webim.ONLINE, "state ONLINE");
		ok(true, "go");
	});
	im.bind("offline", function(){
		ok(im.state === webim.OFFLINE, "state OFFLINE");
		ok(true, "stop");
		start();
	});
	im.online();
});
