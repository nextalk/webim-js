module("setting");

test("webim.setting", function() {
	expect( 3 );
	var setting = new webim.setting();
	setting.set("play_sound", false);
	ok(!setting.get("play_sound"), "arguments key,value");
	setting.bind( "update", function( e, k, v ) {
		ok( k, "update event" );
	} );
	setting.set({"play_sound": true});
	ok(setting.get("play_sound"), "hash key,value");

});
