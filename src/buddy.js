/**
* buddy //联系人
*/

model( "buddy", {
	active: true
}, {
	_init: function(){
		var self = this;
		self.data = self.data || [];
		self.dataHash = {};
		self.set( self.data );
	},
	clear:function() {
		var self =this;
		self.data = [];
		self.dataHash = {};
	},
	count: function(conditions){
		var data = this.dataHash, count = 0, t;
		for(var key in data){
			if( isObject( conditions ) ) {
				t = true;
				for(var k in conditions){
					if( conditions[k] != data[key][k] ) t = false;
				}
				if(t) count++;
			}else{
				count ++;
			}
		}
		return count;
	},
	get: function( id ) {
		return this.dataHash[ id ];
	},
	all: function( onlyVisible ){
		if( onlyVisible )
			return grep(this.data, function(a){ return a.show != "invisible" && a.presence == "online"});
		else
			return this.data;
	},
	complete: function() {
		var self = this, data = self.dataHash, ids = [], v;
		for( var key in data ) {
			v = data[ key ];
			//Will load offline info for show unavailable buddy.
			//if( v.incomplete && v.presence == 'online' ) {
			if( v.incomplete ) {
				//Don't load repeat. 
				v.incomplete = false;
				ids.push( key );
			}
		}
		self.load( ids );
	},
	update: function( ids ) {
		this.load( ids );
	},
	presence: function( data ) {
		var self = this, dataHash = self.dataHash;
		data = isArray( data ) ? data : [ data ];
		//Complete presence info.
		for( var i in data ) {
			var v = data[ i ];
			//Presence in [show,offline,online]
			v.presence = v.presence == "offline" ? "offline" : "online";
			v.incomplete = !dataHash[ v.id ];
			if( !v.group && v.id ) {
				v.group = v.id.indexOf("vid:") == 0 ? "visitor" : v.group;
			}
		}
		self.set( data );
	},
	load: function( ids ) {
		ids = idsArray( ids );
		if( ids.length ) {
			var self = this, options = self.options;
			ajax( {
				type: "get",
				url: route( "buddies" ),
				cache: false,
				data:{ ids: ids.join(","), csrf_token: webim.csrf_token },
				context: self,
				success: self.set
			} );
		}
	},
	set: function( addData ) {
		var self = this, data = self.data, dataHash = self.dataHash, status = {};
		addData = addData || [];
		var l = addData.length, v, type, add, id;
		for(var i = 0; i < l; i++){
		//for(var i in addData){
			v = addData[i], id = v.id;
			if(id){
				if(!dataHash[id]){
					v.presence = v.presence || "online";
					v.show = v.show ? v.show : (v.presence == "offline" ? "unavailable" : "available");
					dataHash[id] = {};
					data.push(dataHash[id]);
				}
				v.incomplete = !!v.incomplete;
				add = checkUpdate(dataHash[id], v);
				if(add){
					type = add.presence || "update";
					status[type] = status[type] || [];
					extend(dataHash[id], add);
					status[type].push(dataHash[id]);
				}
			}
		}
		for ( var key in status ) {
			self.trigger( key, [ status[key] ] );
		}
		self.options.active && self.complete();
	}
} );
