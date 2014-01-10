/*
 * 状态(cookie临时存储[刷新页面有效])
 * 
 * get(key);//get
 * set(key,value);//set
 * clear()
 */
//var d = {
//        tabs:{1:{n:5}}, // n -> notice count
//        tabIds:[1],
//        p:5, //tab prevCount
//        a:5, //tab activeTabId
//        b:0, //is buddy open
//        o:0 //has offline
//}

model( "status", {
	key:"_webim"
}, {
	_init:function() {
		var self = this, data = self.data, key = self.options.key;
		var store = window.localStorage;
		if( store ) {
			//无痕浏览模式
			try {
				var testKey = '__store_webim__'
				store.setItem(testKey, testKey)
				if (store.getItem(testKey) == testKey) { 
					self.store = store;
				}
				store.removeItem(testKey);
			} catch(e) {
				self.store = undefined;
			}
		}
		if ( !data ) {
			var c = self.store ? self.store.getItem( key ) : cookie( key );
			self.data = c ? JSON.parse( c ) : {};
		}else{
			self._save( data );
		}
	},
	set: function( key, value ) {
		var options = key, self = this;
		if (typeof key == "string") {
			options = {};
			options[key] = value;
		}
		var old = self.data;
		if ( checkUpdate( old, options ) ) {
			var _new = extend( {}, old, options );
			self._save( _new );
		}
	},
	get: function( key ) {
		return this.data[ key ];
	},
	clear: function() {
		this._save( {} );
	},
	_save: function( data ) {
		var self = this, key = self.options.key;
		self.data = data;
		data = JSON.stringify( data );
		self.store ? self.store.setItem( key, data ) : cookie( key, data, {
			path: '/',
			domain: document.domain
		} );
	}
} );

