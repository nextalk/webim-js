/*!
 * ClassEvent.js v0.2
 *
 * http://github.com/webim/ClassEvent.js
 *
 * Copyright (c) 2010 Hidden
 * Released under the MIT, BSD, and GPL Licenses.
 *
 */

function ClassEvent( type ) {
	this.type =  type;
	this.timeStamp = ( new Date() ).getTime();
}

ClassEvent.on = function() {
	var proto, helper = ClassEvent.on.prototype;
	for ( var i = 0, l = arguments.length; i < l; i++ ) {
		proto = arguments[ i ].prototype;
		proto.bind = proto.addEventListener = helper.addEventListener;
		proto.unbind = proto.removeEventListener = helper.removeEventListener;
		proto.trigger = proto.dispatchEvent = helper.dispatchEvent;
	}
};


ClassEvent.on.prototype = {
	addEventListener: function( type, listener ) {
		var self = this, ls = self.__listeners = self.__listeners || {};
		ls[ type ] = ls[ type ] || [];
		ls[ type ].push( listener );
		return self;
	},
	dispatchEvent: function( event, extraParameters ) {
		var self = this, ls = self.__listeners = self.__listeners || {};
		event = event.type ? event : new ClassEvent( event );
		ls = ls[ event.type ];
		if ( Object.prototype.toString.call( extraParameters ) === "[object Array]" ) {
			extraParameters.unshift( event );
		} else {
			extraParameters = [ event, extraParameters ];
		}
		if ( ls ) {
			for ( var i = 0, l = ls.length; i < l; i++ ) {
				ls[ i ].apply( self, extraParameters );
			}
		}
		return self;
	},
	removeEventListener: function( type, listener ) {
		var self = this, ls = self.__listeners = self.__listeners || {};
		if ( ls[ type ] ) {
			if ( listener ) {
				var _e = ls[ type ];
				for ( var i = _e.length; i--; i ) {
					if ( _e[ i ] === listener ) 
						_e.splice( i, 1 );
				}
			} else {
				delete ls[ type ];
			}
		}
		return self;
	}
};
