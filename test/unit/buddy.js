module("buddy");

test("webim.buddy - basic method", 9, function(){
	stop(3000);
	var buddy = new webim.buddy( buddies, {active: false} );
	buddy.bind("online", function(e, data){
		ok(true, "online event:" + JSON.stringify(data));
	});
	buddy.bind("offline", function(e, data){
		ok(data[0], "offline event:" + JSON.stringify(data));
	});
	buddy.bind("update", function(e, data){
		ok(data[0], "update event:" + JSON.stringify(data));
		if(data[0]["id"] == 4)start();
	});
	ok(buddy.get(2), "get");
	ok(buddy.count() == 3, "count");
	buddy.clear();
	ok(!buddy.get(2), "clear");
	buddy.presence([{id: 2, presence: "online"}, {id: 3, presence: "offline"}, {id: 2, presence: "show", show: "away"}]);
	buddy.complete();
	buddy.options.active = true;
	buddy.presence([{id: 4, presence: "online"}]);
});
