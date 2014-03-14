/*
* room
*
*/
( function() {
	model("room", {
	},{
		_init: function() {
			var self = this;
			self.data = self.data || [];
			self.dataHash = {};
		},
		get: function(id) {
			return this.dataHash[id];
		},
		all: function( onlyTemporary ){
			if( onlyTemporary )
				return grep(this.data, function(a){ return a.temporary });
			else
				return this.data;
		},
        //Invite members to create a temporary room
        invite: function(id, nick, members, callback) {
			var self = this, options = self.options, user = options.user;
			ajax({
				type: "post",
				cache: false,
				url: route( "invite" ),
				data: {
					ticket: options.ticket,
					id: id,
					nick: nick || "", 
                    members: members.join(","),
					csrf_token: webim.csrf_token
				},
                //data is a room object
				success: function( data ) {
					self.set( [ data ] );
					self.loadMember( id );
					callback && callback( data );
				}
			});
                
        },
		join:function(id, nick, callback){
			var self = this, options = self.options, d = self.dataHash[id], user = options.user;

			ajax({
				type: "post",
				cache: false,
				url: route( "join" ),
				data: {
					ticket: options.ticket,
					id: id,
                    //temporary: d.temporary,
					nick: nick || "", 
					csrf_token: webim.csrf_token
				},
				success: function( data ) {
					self.set( [ data ] );
					self.loadMember( id );
					callback && callback( data );
				}
			});
		},
		leave: function(id) {
			var self = this, options = self.options, d = self.dataHash[id], user = options.user;
			if(d) {
				ajax({
					type: "post",
					cache: false,
					url: route( "leave" ),
					data: {
						ticket: options.ticket,
						id: id,
						nick: user.nick, 
                        temporary: d.temporary,
						csrf_token: webim.csrf_token
                    },
                    success: function( data ) {
                        delete self.dataHash[id];
                        self.trigger("leaved",[id]);
                    }
				});
			}
		},
		block: function(id) {
			var self = this, options = self.options, d = self.dataHash[id];
			if(d && !d.blocked){
				d.blocked = true;
				var list = [];
				each(self.dataHash, function(n,v){
					if(!v.temporary && v.blocked) list.push(v.id);
				});
				ajax({
					type: "post",
					cache: false,
					url: route( "block" ),
					data: {
						ticket: options.ticket,
						id: id,
						csrf_token: webim.csrf_token
                    },
                    success: function(data) {
                        self.trigger("blocked",[id, list]);
                    }
				});
			}
		},
		unblock: function(id) {
			var self = this, options = self.options, d = self.dataHash[id];
			if(d && d.blocked){
				d.blocked = false;
				var list = [];
				each(self.dataHash,function(n,v){
					if(!v.temporary && v.blocked) list.push(v.id);
				});
				ajax({
					type: "post",
					cache: false,
					url: route( "unblock" ),
					data: {
						ticket: options.ticket,
						id: id,
						csrf_token: webim.csrf_token
                    },
                    success: function(data) {
                        self.trigger("unblocked",[id, list]);
                    }
				});
			}
		},
		set: function(d) {
			var self = this, data = self.data, dataHash = self.dataHash, status = {};
			each(d,function(k,v){
				var id = v.id;
                if(!id) return;

                v.members = v.members || [];
                v.all_count = v.members.length;
                v.count = 0;
                each(v.members, function(k, m) {
                    if(m.presence == "online")  {
                        v.count += 1;
                    }
                });
                if(!dataHash[id]){
                    dataHash[id] = v;
                    data.push(v);
                } else {
                    extend(dataHash[id], v);
                    //TODO: compare and trigger
                }
                self.trigger("updated", dataHash[id]);
			});
		},
		loadMember: function(id) {
			var self = this, options = self.options;
			ajax( {
				type: "get",
				cache: false,
				url: route( "members" ),
				data: {
					ticket: options.ticket,
					id: id,
					csrf_token: webim.csrf_token
				},
				success: function(data){
					self.updateMember(id, data);
				}
			});
		},

        updateMember: function(room_id, data) {
			var room = this.dataHash[room_id];
            if(room) {
                room.memberLoaded = true;
                room.members = data;
                this.set([room]);
            }
        },

        onPresence: function(presence) {
			var self = this, tp = presence.type;
            if( (tp == "join") || (tp == "leave") ) {
                var roomId = presence.to || presence.status;
                var oneRoom = this.dataHash[roomId];
                if(oneRoom && oneRoom.memberLoaded) {
                    //alert("reloading " + roomId);
                    self.loadMember(roomId);
                }
                if(tp == "join") {
                    self.trigger("memberJoined", [roomId, presence]);
                } else {
                    self.trigger("memberLeaved", [roomId, presence]);
                }
            }
        },

		clear:function(){
			var self = this;
			self.data = [];
			self.dataHash = {};
		}
	} );
} )();
