
function webim( element, options ) {
	this.options = extend( {}, webim.defaults, options );
	this._init( element, options );
}

ClassEvent.on( webim );

webim.csrf_token = "";
webim.OFFLINE = 0;
webim.BEFOREONLINE = 1;
webim.ONLINE = 2;

extend(webim.prototype, {
	state: webim.OFFLINE,
	_init: function() {
		var self = this, options = self.options;
		//Default user status info.
		self.data = {
			user: {
				presence: 'offline', 
				show: 'unavailable'
			}
		};
        self.models = {}


		ajax.settings.dataType = options.jsonp ? "jsonp" : "json";

		self.status = new webim.status(null, options);
		self.setting = new webim.setting();
        self.models['presence'] = new webim.presence();
		self.buddy = new webim.buddy();
		self.room = new webim.room(null, self.data );
		self.history = new webim.history(null, self.data );
		self._initEvents();
	},
	_createConnect: function() {
		var self = this;
		var url = self.data.connection;

		self.connection = self.options.connectionType != "jsonpd" 
			&& url.websocket && socket.enable ? 
			new socket( url.websocket, url ) : new comet( url.server + ( /\?/.test( url ) ? "&" : "?" ) + ajax.param( { ticket: url.ticket, domain: url.domain } ) );

		self.connection.bind( "connect",function( e, data ) {
		}).bind( "message", function( e, data ) {
			self.handle( data );
		}).bind( "error", function( e, data ){
			self._stop( "connect", "Connect Error" );
		}).bind( "close", function( e, data ) {
			self._stop( "connect", "Disconnect" );
		});
	},
	setUser: function( info ) {
		extend( this.data.user, info );
	},
	_ready: function( post_data ) {
		var self = this;
		self.state = webim.BEFOREONLINE;
		//self._unloadFun = window.onbeforeunload;
		//window.onbeforeunload = function(){
		//	self._deactivate();
		//};
		self.trigger( "beforeOnline", [ post_data ] );
	},
	_go: function() {
		var self = this, data = self.data, history = self.history, buddy = self.buddy, room = self.room, presence = self.models['presence'];
		self.state = webim.ONLINE;
		history.options.userInfo = data.user;
		var ids = [];
        //buddies
		each( data.buddies, function(n, v) {
			history.init( "chat", v.id, v.history );
		});
		buddy.set( data.buddies );

        //added in version 5.5
        //presences
        if(data.presences) { 
            presence.set(data.presences); 
        } else {
            presence.set(map(data.buddies, function(b) { 
                var p = {};
                p[b.id] = b.show;
                return p; 
            }));
        }

		//rooms
		each( data.rooms, function(n, v) {
			history.init( "grpchat", v.id, v.history );
		});
        //FIXED BY ery
		//blocked rooms
		//var b = self.setting.get("blocked_rooms"), roomData = data.rooms;
		//isArray(b) && roomData && each(b,function(n,v){
		//	roomData[v] && (roomData[v].blocked = true);
		//});
		room.set(data.rooms);
		room.options.ticket = data.connection.ticket;
		self.trigger("online",[data]);
		self._createConnect();
		//handle new messages at last
		var n_msg = [];
		if( data.new_messages ) {
			n_msg = n_msg.concat( data.new_messages );
		}
		if( data.offline_messages ) {
			n_msg = n_msg.concat( data.offline_messages );
		}
		if(n_msg && n_msg.length){
			each(n_msg, function(n, v){
				v["new"] = true;
			});
			self.trigger("message",[n_msg]);
		}
	},
	_stop: function( type, msg ){
		var self = this;
		if ( self.state === webim.OFFLINE ) {
			return;
		}
		self.state = webim.OFFLINE;
		//window.onbeforeunload = self._unloadFun;
		self.data.user.presence = "offline";
		self.data.user.show = "unavailable";
		self.buddy.clear();
        self.models['presence'].clear();
		self.room.clear();
		self.history.clean();
		self.trigger("offline", [type, msg] );
	},
	autoOnline: function(){
		return !this.status.get("o");
	},
	_initEvents: function(){
		var self = this
		  , status = self.status
		  , setting = self.setting
		  , history = self.history
		  , buddy = self.buddy
          , presence = self.models['presence']
		  , room = self.room;

		self.bind( "message", function( e, data ) {
			var online_buddies = [], l = data.length, uid = self.data.user.id, v, id, type;
			//When revice a new message from router server, make the buddy online.
			for(var i = 0; i < l; i++){
				v = data[i];
				type = v["type"];
				id = type == "chat" ? (v.to == uid ? v.from : v.to) : v.to;
				v["id"] = id;
				if( type == "chat" && !v["new"] ) {
					var msg = { id: id, presence: "online" };
					//update nick.
					if( v.nick && v.to == uid ) msg.nick = v.nick;
					online_buddies.push( msg );
				}
			}
			if( online_buddies.length ) {
				buddy.presence( online_buddies );
				//the chat window will pop out, need complete info
				buddy.complete();
			}
			history.set( data );
		});

		self.bind("presence", function( e, data ) {
            var pl = grep( data, grepPresence );
			buddy.presence( map( pl, mapFrom ) );
            //fix issue #35
            presence.update(pl);
			data = grep( data, grepRoomPresence );
			for (var i = data.length - 1; i >= 0; i--) {
                /*
                 * Redsigned by ery
                 * 
                 * Load all members when leaved
                 */
                room.onPresence(data[i]);
			};
		});

		function mapFrom( a ) { 
			var d = { id: a.from, presence: a.type }; 
			if( a.show ) d.show = a.show;
			if( a.nick ) d.nick = a.nick;
			if( a.status ) d.status = a.status;
			return d;
		}

		function grepPresence( a ){
			return a.type == "online" || a.type == "offline" || a.type == "show";
		}
		function grepRoomPresence( a ){
			return a.type == "grponline" || a.type == "grpoffline" || a.type == "invite" || a.type == "join" || a.type == "leave";
		}
	},
	handle: function(data){
		var self = this;
		if( data.messages && data.messages.length ){
			var origin = data.messages
			  , msgs = []
			  , events = [];
			for (var i = 0; i < origin.length; i++) {
				var msg = origin[i];
				if( msg.body && msg.body.indexOf("webim-event:") == 0 ){
					msg.event = msg.body.replace("webim-event:", "").split("|,|");
					events.push( msg );
				} else {
					msgs.push( msg );
				}
			};
			msgs.length && self.trigger( "message", [ msgs ] );
			events.length && self.trigger( "event", [ events ] );
		}
		data.presences && data.presences.length && self.trigger( "presence", [ data.presences ] );
		data.statuses && data.statuses.length && self.trigger( "status", [ data.statuses ] );
	},
	sendMessage: function( msg, callback ) {
		var self = this;
		msg.ticket = self.data.connection.ticket;
		self.trigger( "sendMessage", [ msg ] );
		ajax({
			type:"post",
			cache: false,
			url: route( "message" ),
			data: extend({csrf_token: webim.csrf_token}, msg),
			success: callback,
			error: callback
		});
	},
	sendStatus: function( msg, callback ){
		var self = this;
		msg.ticket = self.data.connection.ticket;
		self.trigger( "sendStatus", [ msg ] );
		ajax({
			type:"post",
			cache: false,
			url: route( "status" ),			
			data: extend({csrf_token: webim.csrf_token}, msg),
			success: callback,
			error: callback
		});
	},
	sendPresence: function( msg, callback ){
		var self = this;
		msg.ticket = self.data.connection.ticket;
		//save show status
		self.data.user.show = msg.show;
		self.status.set( "s", msg.show );
		self.trigger( "sendPresence", [ msg ] );
		ajax( {
			type:"post",
			cache: false,
			url: route( "presence" ),			
			data: extend({csrf_token: webim.csrf_token}, msg),
			success: callback,
			error: callback
		} );
	},
	online: function( params ) {
		var self = this, status = self.status;
		if ( self.state !== webim.OFFLINE ) {
			return;
		}

		var buddy_ids = [], room_ids = [], tabs = status.get("tabs"), tabIds = status.get("tabIds");
		if(tabIds && tabIds.length && tabs){
			each(tabs, function(k,v){
				if(k[0] == "b") buddy_ids.push(k.slice(2));
				if(k[0] == "r") room_ids.push(k.slice(2));
			});
		}
		params = extend({                                
			//chatlink_ids: self.chatlink_ids.join(","),
			buddy_ids: buddy_ids.join(","),
			room_ids: room_ids.join(","),
			csrf_token: webim.csrf_token,
			show: status.get("s") || "available"
		}, params);
		self._ready(params);
		//set auto open true
		status.set("o", false);
		status.set("s", params.show);

		ajax({
			type:"post",
			cache: false,
			url: route( "online" ),
			data: params,
			success: function( data ){
				if( !data ){
					self._stop( "online", "Not Found" );
				}else if( !data.success ) {
					self._stop( "online", data.error_msg );
				}else{
					data.user = extend( self.data.user, data.user, { presence: "online" } );
					self.data = data;
					self._go();
				}
			},
			error: function( data ) {
				self._stop( "online", "Not Found" );
			}
		});
	},
	offline: function() {
		var self = this, data = self.data;
		if ( self.state === webim.OFFLINE ) {
			return;
		}
		self.status.set("o", true);
		self.connection.close();
		self._stop("offline", "offline");
		ajax({
			type:"post",
			cache: false,
			url: route( "offline" ),
			data: {
				status: 'offline',
				csrf_token: webim.csrf_token,
				ticket: data.connection.ticket
			}
		});

	},
	_deactivate: function(){
		var self = this, data = self.data;
		if( !data || !data.connection || !data.connection.ticket ) return;
		ajax( {
			type:"get",
			cache: false,
			url: route( "deactivate" ),
			data: {
				ticket: data.connection.ticket,
				csrf_token: webim.csrf_token
			}
		} );
	}

});

function idsArray( ids ) {
	return ids && ids.split ? ids.split( "," ) : ( isArray( ids ) ? ids : ( parseInt( ids ) ? [ parseInt( ids ) ] : [] ) );
}

function model( name, defaults, proto ) {
	function m( data, options ) {
		var self = this;
		self.data = data;
		self.options = extend( {}, m.defaults, options );
		isFunction( self._init ) && self._init();
	}
	m.defaults = defaults;
	ClassEvent.on( m );
	extend( m.prototype, proto );
	webim[ name ] = m;
}

function route( ob, val ) {
	var options = ob;
	if( typeof ob == "string" ) {
		options[ ob ] = val;
		if ( val === undefined )
			return route[ ob ];
	}
	extend( route, options );
}

//_webim = window.webim;
window.webim = webim;

extend( webim, {
	version: "@VERSION",
	defaults:{
	},
	log: log,
	idsArray: idsArray,
	now: now,
	isFunction: isFunction,
	isArray: isArray,
	isObject: isObject,
	trim: trim,
	makeArray: makeArray,
	extend: extend,
	each: each,
	inArray: inArray,
	grep: grep,
	map: map,
	JSON: JSON,
	ajax: ajax,
	comet: comet,
	socket: socket,
	model: model,
	route: route,
	ClassEvent: ClassEvent,
	isMobile: isMobile
} );
