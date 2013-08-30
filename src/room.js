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
		block: function(id) {
			var self = this, d = self.dataHash[id];
			if(d && !d.blocked){
				d.blocked = true;
				var list = [];
				each(self.dataHash,function(n,v){
					if(!v.temporary && v.blocked) list.push(v.id);
				});
				self.trigger("block",[id, list]);
			}
		},
		unblock: function(id) {
			var self = this, d = self.dataHash[id];
			if(d && d.blocked){
				d.blocked = false;
				var list = [];
				each(self.dataHash,function(n,v){
					if(!v.temporary && v.blocked) list.push(v.id);
				});
				self.trigger("unblock",[id, list]);
			}
		},
		set: function(d) {
			var self = this, data = self.data, dataHash = self.dataHash, status = {};
			each(d,function(k,v){
				var id = v.id;
				if(id){
					v.members = v.members || [];
					v.count = v.count || 0;
					v.all_count = v.all_count || 0;
					if(!dataHash[id]){
						dataHash[id] = v;
						data.push(v);
					}
					else extend(dataHash[id], v);
					self.trigger("join",[dataHash[id]]);
				}

			});
		},
		addMember: function(room_id, info){
			var self = this;
			if(isArray(info)){
				each(info, function(k,v){
					self.addMember(room_id, v);
				});
				return;
			};
			var room = self.dataHash[room_id];
			if(room){
				var members = room.members, member;
				for (var i = members.length; i--; i){
					if (members[i].id == info.id) {
						member = members[i];
					}
				}
				if(!member){
					info.nick = info.nick;
					members.push(info);
					room.count = members.length;
					self.trigger("addMember",[room_id, info]);
				}
			}
		},
		removeMember: function(room_id, member_id){
			var self = this
			  , room = this.dataHash[room_id];
			if(room){
				var members = room.members, member;
				for (var i = members.length; i--; i){
					if (members[i].id == member_id) {
						member = members[i];
						members.splice(i, 1);
						room.count--;
					}
				}
				member && self.trigger("removeMember",[room_id, member]);
			}
		},
		initMember: function(id){
			var room = this.dataHash[id];
			if(room && !room.initMember){
				room.initMember = true;
				this.loadMember(id);
			}
		},
		loadMember: function(id){
			var self = this, options = self.options;
			ajax( {
				type: "get",
				cache: false,
				url: route( "members" ),
				dataType: "jsonp",
				data: {
					ticket: options.ticket,
					id: id
				},
				success: function(data){
					self.addMember(id, data);
				}
			});
		},
		join:function(id, nick, callback){
			var self = this, options = self.options, user = options.user;

			ajax({
				type: "get",
				cache: false,
				url: route( "join" ),
				dataType: "jsonp",
				data: {
					ticket: options.ticket,
					id: id,
					nick: nick || ""
				},
				success: function( data ) {
					self.initMember( id );
					self.set( [ data ] );
					callback && callback( data );
				}
			});
		},
		leave: function(id){
			var self = this, options = self.options, d = self.dataHash[id], user = options.user;
			if(d){
				d.initMember = false;
				ajax({
					type: "get",
					cache: false,
					url: route( "leave" ),
					dataType: "jsonp",					
					data: {
						ticket: options.ticket,
						id: id,
						nick: user.nick
					}
				});
				self.trigger("leave",[d]);
			}
		},
		clear:function(){
		}
	} );
} )();
