module("jsonp");

test("webim.jsonp() - async callbacks", function() {
	expect( 3 );
	stop();
	webim.jsonp({
		url: _path + "data/packets.php",
		async: true,
		timeout: 20000,
		data: {
			ticket: "dddd"
		},
		success: function(text){ 
			ok(true, "polling callback"); 
			start(); 
		}
	});
	setTimeout(function(){
		webim.jsonp({
			url: _path + "data/error.php",
			data: {
				type: "chat",
				id: 2
			},
			async: true,
			success: function(text){ 
				ok(false, "error handle success"); 
				start(); 
			}, 
			error: function( data ) {
				ok(true, "error callback"); 
			}
		});
		webim.jsonp({
			url: _path + "data/history.php",
			data: {
				type: "chat",
				id: 2
			},
			async: true,
			success: function(text){ 
				ok(true, "success callback"); 
			}, 
			error: function( data ) {
				ok(false, "error handle error"); 
			}
		});
	}, 1000);
});

/*
test("webim.jsonp() - error callbacks", function() {
expect( 1 );
stop();
webim.jsonp({
url: _path + "data/jsonp.html",
error: function(){ 
ok(true, "error"); 
start(); 
}
});
});

test("webim.jsonp() - correct data", function() {
expect( 1 );
stop();
webim.jsonp({
url: _path + "data/jsonp.html",
success: function(text){ 
equals("success", webim.trim(text), "correct"); 
start(); 
}
});
});
*/
