/*!
* comet.js v0.1
*
* http://github.com/webim/comet.js
*
* Copyright (c) 2010 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
* Depends:
* 	ClassEvent.js http://github.com/webim/ClassEvent.js
* 	ajax.js http://github.com/webim/ajax.js
*
*/

function comet( url ) {
	var self = this;
	self.URL = url;
	self._setting();
	self._connect();
}

comet.prototype = {
	readyState: 0,
	send: function( data ) {
	},
	_setting: function(){
		var self = this;
		self.readyState = comet.CLOSED;//是否已连接 只读属性
		self._connecting = false; //设置连接开关避免重复连接
		self._onPolling = false; //避免重复polling
		self._pollTimer = null;
		self._pollingTimes = 0; //polling次数 第一次成功后 connected = true; 
		self._failTimes = 0;//polling失败累加2次判定服务器关闭连接
	},
	_connect: function(){
		//连接
		var self = this;
		if ( self._connecting ) 
			return self;
		self.readyState = comet.CONNECTING;
		self._connecting = true;
		if ( !self._onPolling ) {
			window.setTimeout( function() {
				self._startPolling();
			}, 300 );
		}
		return self;
	},
	close: function(){
		var self = this;
		if ( self._pollTimer ) 
			clearTimeout( self._pollTimer );
		self._setting();
		return self;
	},
	_onConnect: function() {
		var self = this;
		self.readyState = comet.OPEN;
		self.trigger( 'open', 'success' );
	},
	_onClose: function( m ) {
		var self = this;
		self._setting();
		//Delay trigger event when reflesh web site
		setTimeout( function(){
			self.trigger( 'close', [ m ] );
		}, 1000 );
	},
	_onData: function(data) {
		var self = this;
		self.trigger( 'message', [ data ] );
	},
	_onError: function( text ) {
		var self = this;
		self._setting();
		//Delay trigger event when reflesh web site
		setTimeout( function(){
			self.trigger( 'error', [ text ] );
		}, 1000 );
	},
	_startPolling: function() {
		var self = this;
		if ( !self._connecting )
			return;
		self._onPolling = true;
		self._pollingTimes++;
		ajax( {
			url: self.URL,
			dataType: 'jsonp',
			cache: false,
			context: self,
			success: self._onPollSuccess,
			error: self._onPollError
		} );
	},
	_onPollSuccess: function(d){
		var self = this;
		self._onPolling = false;
		if ( self._connecting ) {
			if( !d ) {
				return self._onError('error data');
			}else{
				if ( self._pollingTimes == 1 ) {
					self._onConnect();
				}
				self._onData( d );
				self._failTimes = 0;//连接成功 失败累加清零
				self._pollTimer = window.setTimeout(function(){
					self._startPolling();
				}, 200);
			}
		}
	},
	_onPollError: function( m ) {
		var self = this;
		self._onPolling = false;
		if (!self._connecting) 
			return;//已断开连接
		self._failTimes++;
		if (self._pollingTimes == 1) 
			self._onError('can not connect.');
		else{
			if (self._failTimes > 1) {
				//服务器关闭连接
				self._onClose( m );
			}
			else {
				self._pollTimer = window.setTimeout(function(){
					self._startPolling();
				}, 200);
			}
		}
	}
};

//The connection has not yet been established.
comet.CONNECTING = 0;

//The connection is established and communication is possible.
comet.OPEN = 1;

//The connection has been closed or could not be opened.
comet.CLOSED = 2;

//Make the class work with custom events
ClassEvent.on( comet );
