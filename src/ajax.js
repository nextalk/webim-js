/*!
 * ajax.js v0.1
 *
 * http://github.com/webim/ajax.js
 *
 * Copyright (c) 2010 Hidden
 * Released under the MIT, BSD, and GPL Licenses.
 *
 */
var ajax = ( function(){
	var jsc = ( new Date() ).getTime(),
	//Firefox 3.6 and chrome 6 support script async attribute.
	scriptAsync = typeof( document.createElement( "script" ).async ) === "boolean",
	rnoContent = /^(?:GET|HEAD|DELETE)$/,
	rnotwhite = /\S/,
	rbracket = /\[\]$/,
	jsre = /\=\?(&|$)/,
	rquery = /\?/,
	rts = /([?&])_=[^&]*/,
rurl = /^(\w+:)?\/\/([^\/?#]+)/,
r20 = /%20/g,
rhash = /#.*$/;

// IE can async load script in fragment.
window._fragmentProxy = false;
//Check fragment proxy
var frag = document.createDocumentFragment(),
script = document.createElement( 'script' ),
text = "window._fragmentProxy = true";
try{
	script.appendChild( document.createTextNode( text ) );
} catch( e ){
	script.text = text;
}
frag.appendChild( script );
frag = script = null;

function ajax( origSettings ) {
	var s = {};

	for( var key in ajax.settings ) {
		s[ key ] = ajax.settings[ key ];
	}

	if ( origSettings ) {
		for( var key in origSettings ) {
			s[ key ] = origSettings[ key ];
		}
	}

	//Only GET when jsonp
	if( s.dataType === "jsonp" ) {
		s.type = "GET";
	}

	var jsonp, status, data, type = s.type.toUpperCase(), noContent = rnoContent.test(type), head, proxy, win = window, script;

	s.url = s.url.replace( rhash, "" );

	// Use original (not extended) context object if it was provided
	s.context = origSettings && origSettings.context != null ? origSettings.context : s;

	// convert data if not already a string
	if ( s.data && s.processData && typeof s.data !== "string" ) {
		s.data = param( s.data, s.traditional );
	}

	// Matches an absolute URL, and saves the domain
	var parts = rurl.exec( s.url ),
	location = window.location,
	remote = parts && ( parts[1] && parts[1] !== location.protocol || parts[2] !== location.host );

	if ( ! /https?:/i.test( location.protocol ) ) {
		//The protocol is "app:" in air.
		remote = false;
	}
	remote = s.forceRemote ? true : remote;
	if ( s.dataType === "jsonp" && !remote ) {
		s.dataType = "json";
	}

	// Handle JSONP Parameter Callbacks
	if ( s.dataType === "jsonp" ) {
		if ( type === "GET" ) {
			if ( !jsre.test( s.url ) ) {
				s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
			}
		} else if ( !s.data || !jsre.test(s.data) ) {
			s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
		}
		s.dataType = "json";
	}

	// Build temporary JSONP function
	if ( s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url)) ) {
		jsonp = s.jsonpCallback || ("jsonp" + jsc++);

		// Replace the =? sequence both in the query string and the data
		if ( s.data ) {
			s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
		}

		s.url = s.url.replace(jsre, "=" + jsonp + "$1");

		// We need to make sure
		// that a JSONP style response is executed properly
		s.dataType = "script";

		// Handle JSONP-style loading
		var customJsonp = window[ jsonp ], jsonpDone = false;

		window[ jsonp ] = function( tmp ) {
			if ( !jsonpDone ) {
				jsonpDone = true;
				if ( Object.prototype.toString.call( customJsonp ) === "[object Function]" ) {
					customJsonp( tmp );

				} else {
					// Garbage collect
					window[ jsonp ] = undefined;

					try {
						delete window[ jsonp ];
					} catch( jsonpError ) {}
				}

				data = tmp;
				helper.handleSuccess( s, xhr, status, data );
				helper.handleComplete( s, xhr, status, data );

				if ( head ) {
					head.removeChild( script );
				}
				proxy && proxy.parentNode && proxy.parentNode.removeChild( proxy );
			}
		}
	}

	if ( s.dataType === "script" && s.cache === null ) {
		s.cache = false;
	}

	if ( s.cache === false && type === "GET" ) {
		var ts = ( new Date() ).getTime();

		// try replacing _= if it is there
		var ret = s.url.replace(rts, "$1_=" + ts);

		// if nothing was replaced, add timestamp to the end
		s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
	}

	// If data is available, append data to url for get requests
	if ( s.data && type === "GET" ) {
		s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
	}

	// Watch for a new set of requests
	if ( s.global && helper.active++ === 0 ) {
		//jQuery.event.trigger( "ajaxStart" );
	}

	// If we're requesting a remote document
	// and trying to load JSON or Script with a GET
	if ( s.dataType === "script" && type === "GET" && remote ) {
		var inFrame = false;
		if ( jsonp && s.async && !scriptAsync ) {
			if( window._fragmentProxy ) {
				proxy = document.createDocumentFragment();
				head = proxy;
			} else {
				inFrame = true;
				// Opera need url path in iframe
				if( s.url.slice(0, 1) == "/" ) {
					s.url = location.protocol + "//" + location.host + (location.port ? (":" + location.port) : "" ) + s.url;
				}
				else if( !/^https?:\/\//i.test( s.url ) ){
					var href = location.href,
				ex = /([^?#]+)\//.exec( href );
				s.url = ( ex ? ex[1] : href ) + "/" + s.url;
				}
				s.url = s.url.replace( "=" + jsonp, "=parent." + jsonp );
				proxy = document.createElement( "iframe" );
				proxy.style.position = "absolute";
				proxy.style.left = "-100px";
				proxy.style.top = "-100px";
				proxy.style.height = "1px";
				proxy.style.width = "1px";
				proxy.style.visibility = "hidden";
				document.body.insertBefore( proxy, document.body.firstChild );
				win = proxy.contentWindow;
			}
		}
		function create() {
            var doc;
            try{
                //“Access is denied” when set `document.domain=""`
                //http://stackoverflow.com/questions/1886547/access-is-denied-javascript-error-when-trying-to-access-the-document-object-of
                doc = win.document
            } catch(e){
                doc = window.document
            };
			head = head || doc.getElementsByTagName("head")[0] || doc.documentElement;
			script = doc.createElement("script");
			if ( s.scriptCharset ) {
				script.charset = s.scriptCharset;
			}
			script.src = s.url;

			if ( scriptAsync )
				script.async = s.async;

			// Handle Script loading
			if ( jsonp ) {
				// Attach handlers for all browsers
				script.onload = script.onerror = script.onreadystatechange = function(e){
					if( !jsonpDone && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
						//error
						jsonpDone = true;
						helper.handleError( s, xhr, "error", "load error" );
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}
						proxy && proxy.parentNode && proxy.parentNode.removeChild( proxy );
					}
				};
			} else {
				var done = false;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function() {
					if ( !done && (!this.readyState ||
						       this.readyState === "loaded" || this.readyState === "complete") ) {
						done = true;
					helper.handleSuccess( s, xhr, status, data );
					helper.handleComplete( s, xhr, status, data );

					// Handle memory leak in IE
					script.onload = script.onreadystatechange = null;
					if ( head && script.parentNode ) {
						head.removeChild( script );
					}
					}
				};
			} 

			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709 and #4378).
			head.insertBefore( script, head.firstChild );
		}
		inFrame ? setTimeout( function() { create() }, 0 ) : create();

		// We handle everything using the script element injection
		return undefined;
	}

	var requestDone = false;

	// Create the request object
	var xhr = s.xhr();

	if ( !xhr ) {
		return;
	}

	// Open the socket
	// Passing null username, generates a login popup on Opera (#2865)
	if ( s.username ) {
		xhr.open(type, s.url, s.async, s.username, s.password);
	} else {
		xhr.open(type, s.url, s.async);
	}

	// Need an extra try/catch for cross domain requests in Firefox 3
	try {
		// Set content-type if data specified and content-body is valid for this type
		if ( (s.data != null && !noContent) || (origSettings && origSettings.contentType) ) {
			xhr.setRequestHeader("Content-Type", s.contentType);
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( helper.lastModified[s.url] ) {
				xhr.setRequestHeader("If-Modified-Since", helper.lastModified[s.url]);
			}

			if ( helper.etag[s.url] ) {
				xhr.setRequestHeader("If-None-Match", helper.etag[s.url]);
			}
		}

		// Set header so the called script knows that it's an XMLHttpRequest
		// Only send the header if it's not a remote XHR
		if ( !remote ) {
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		}

		// Set the Accepts header for the server, depending on the dataType
		xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				     s.accepts[ s.dataType ] + ", */*; q=0.01" :
					     s.accepts._default );
	} catch( headerError ) {}

	// Allow custom headers/mimetypes and early abort
	if ( s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false ) {
		// Handle the global AJAX counter
		if ( s.global && helper.active-- === 1 ) {
			//jQuery.event.trigger( "ajaxStop" );
		}

		// close opended socket
		xhr.abort();
		return false;
	}

	if ( s.global ) {
		helper.triggerGlobal( s, "ajaxSend", [xhr, s] );
	}

	// Wait for a response to come back
	var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {
		// The request was aborted
		if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {
			// Opera doesn't call onreadystatechange before this point
			// so we simulate the call
			if ( !requestDone ) {
				helper.handleComplete( s, xhr, status, data );
			}

			requestDone = true;
			if ( xhr ) {
				xhr.onreadystatechange = helper.noop;
			}

			// The transfer is complete and the data is available, or the request timed out
		} else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {
			requestDone = true;
			xhr.onreadystatechange = helper.noop;

			status = isTimeout === "timeout" ?
				"timeout" :
					!helper.httpSuccess( xhr ) ?
						"error" :
							s.ifModified && helper.httpNotModified( xhr, s.url ) ?
								"notmodified" :
									"success";

			var errMsg;

			if ( status === "success" ) {
				// Watch for, and catch, XML document parse errors
				try {
					// process the data (runs the xml through httpData regardless of callback)
					data = helper.httpData( xhr, s.dataType, s );
				} catch( parserError ) {
					status = "parsererror";
					errMsg = parserError;
				}
			}

			// Make sure that the request was successful or notmodified
			if ( status === "success" || status === "notmodified" ) {
				// JSONP handles its own success callback
				if ( !jsonp ) {
					helper.handleSuccess( s, xhr, status, data );
				}
			} else {
				helper.handleError( s, xhr, status, errMsg );
			}

			// Fire the complete handlers
			if ( !jsonp ) {
				helper.handleComplete( s, xhr, status, data );
			}

			if ( isTimeout === "timeout" ) {
				xhr.abort();
			}

			// Stop memory leaks
			if ( s.async ) {
				xhr = null;
			}
		}
	};

	// Override the abort handler, if we can (IE 6 doesn't allow it, but that's OK)
	// Opera doesn't fire onreadystatechange at all on abort
	try {
		var oldAbort = xhr.abort;
		xhr.abort = function() {
			// xhr.abort in IE7 is not a native JS function
			// and does not have a call property
			if ( xhr && oldAbort.call ) {
				oldAbort.call( xhr );
			}

			onreadystatechange( "abort" );
		};
	} catch( abortError ) {}

	// Timeout checker
	if ( s.async && s.timeout > 0 ) {
		setTimeout(function() {
			// Check to see if the request is still happening
			if ( xhr && !requestDone ) {
				onreadystatechange( "timeout" );
			}
		}, s.timeout);
	}

	// Send the data
	try {
		xhr.send( noContent || s.data == null ? null : s.data );

	} catch( sendError ) {
		helper.handleError( s, xhr, null, sendError );

		// Fire the complete handlers
		helper.handleComplete( s, xhr, status, data );
	}

	// firefox 1.5 doesn't fire statechange for sync requests
	if ( !s.async ) {
		onreadystatechange();
	}

	// return XMLHttpRequest to allow aborting the request etc.
	return xhr;
}

function param( a ) {
	var s = [];
	if ( typeof a == "object"){
		for (var key in a) {
			s[ s.length ] = encodeURIComponent(key) + '=' + encodeURIComponent(a[key]);
		}
		// Return the resulting serialization
		return s.join("&").replace(r20, "+");
	}
	return a;
}

ajax.param = param;

var helper = {
	noop: function() {},
	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	handleError: function( s, xhr, status, e ) {
		// If a local callback was specified, fire it
		if ( s.error ) {
			s.error.call( s.context, xhr, status, e );
		}

		// Fire the global callback
		if ( s.global ) {
			helper.triggerGlobal( s, "ajaxError", [xhr, s, e] );
		}
	},

	handleSuccess: function( s, xhr, status, data ) {
		// If a local callback was specified, fire it and pass it the data
		if ( s.success ) {
			s.success.call( s.context, data, status, xhr );
		}

		// Fire the global callback
		if ( s.global ) {
			helper.triggerGlobal( s, "ajaxSuccess", [xhr, s] );
		}
	},

	handleComplete: function( s, xhr, status ) {
		// Process result
		if ( s.complete ) {
			s.complete.call( s.context, xhr, status );
		}

		// The request was completed
		if ( s.global ) {
			helper.triggerGlobal( s, "ajaxComplete", [xhr, s] );
		}

		// Handle the global AJAX counter
		if ( s.global && helper.active-- === 1 ) {
			//jQuery.event.trigger( "ajaxStop" );
		}
	},

	triggerGlobal: function( s, type, args ) {
		//(s.context && s.context.url == null ? jQuery(s.context) : jQuery.event).trigger(type, args);
	},

	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function( xhr ) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return !xhr.status && location.protocol === "file:" ||
				xhr.status >= 200 && xhr.status < 300 ||
					xhr.status === 304 || xhr.status === 1223;
		} catch(e) {}

		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function( xhr, url ) {
		var lastModified = xhr.getResponseHeader("Last-Modified"),
		etag = xhr.getResponseHeader("Etag");

		if ( lastModified ) {
			helper.lastModified[url] = lastModified;
		}

		if ( etag ) {
			helper.etag[url] = etag;
		}

		return xhr.status === 304;
	},

	httpData: function( xhr, type, s ) {
		var ct = xhr.getResponseHeader("content-type") || "",
		xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
		data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.nodeName === "parsererror" ) {
			helper.error( "parsererror" );
		}

		// Allow a pre-filtering function to sanitize the response
		// s is checked to keep backwards compatibility
		if ( s && s.dataFilter ) {
			data = s.dataFilter( data, type );
		}

		// The filter can actually parse the response
		if ( typeof data === "string" ) {
			// Get the JavaScript object, if JSON is used.
			if ( type === "json" || !type && ct.indexOf("json") >= 0 ) {
				data = data ? 
					( window.JSON && window.JSON.parse ?
					 window.JSON.parse( data ) :
						 (new Function("return " + data))() ) : 
							 data;

				// If the type is "script", eval it in global context
			} else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
				//jQuery.globalEval( data );
				if ( data && rnotwhite.test(data) ) {
					// Inspired by code by Andrea Giammarchi
					// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
					var head = document.getElementsByTagName("head")[0] || document.documentElement,
					script = document.createElement("script");
					script.type = "text/javascript";
					try {
						script.appendChild( document.createTextNode( data ) );
					} catch( e ) {
						script.text = data;
					}

					// Use insertBefore instead of appendChild to circumvent an IE6 bug.
					// This arises when a base node is used (#2709).
					head.insertBefore( script, head.firstChild );
					head.removeChild( script );
				}
			}
		}

		return data;
	}

};


ajax.settings = {
	url: location.href,
	global: true,
	type: "GET",
	contentType: "application/x-www-form-urlencoded",
	processData: true,
	async: true,
/*
* timeout: 0,
* data: null,
* username: null,
* password: null,
* traditional: false,
* */
	// This function can be overriden by calling ajax.setup
	xhr: function() {
		return new window.XMLHttpRequest();
	},
	accepts: {
		xml: "application/xml, text/xml",
		html: "text/html",
		script: "text/javascript, application/javascript",
		json: "application/json, text/javascript",
		text: "text/plain",
		_default: "*/*"
	}
};

ajax.setup = function( settings ) {
	if ( settings ) {
		for( var key in settings ) {
			ajax.settings[ key ] = settings[ key ];
		}
	}
}

/*
* Create the request object; Microsoft failed to properly
* implement the XMLHttpRequest in IE7 (can't request local files),
* so we use the ActiveXObject when it is available
* Additionally XMLHttpRequest can be disabled in IE7/IE8 so
* we need a fallback.
*/
if ( window.ActiveXObject ) {
	ajax.settings.xhr = function() {
		if ( window.location.protocol !== "file:" ) {
			try {
				return new window.XMLHttpRequest();
			} catch(xhrError) {}
		}

		try {
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		} catch(activeError) {}
	};
}
return ajax;
} )();


/**
* 
* JSONP
*
* Safari and chrome not support async opiton, it aways async.
*
* Reference:
*
* http://forum.jquery.com/topic/scriptcommunicator-for-ajax-script-jsonp-loading
* http://d-tune.javaeye.com/blog/506074
*
* Opera: 10.01
* 	run sync.
* 	can't load sync.
* 	trigger onload when load js file with content.
* 	trigger error when src is invalid.
* 	don't trigger any event when src is valid and load error.
* 	don't trigger any event when js file is blank.
*
* Chrome: 6.0
* 	run async when use createElement.
* 	run sync when use document.writeln.
* 	prefect onload and onerror event.
*
* Safari: 5.0
* 	run async.
* 	prefect onload and onerror event.
* 
* Firefox: 3.6
* 	run sync.
* 	support async by set script.async = true.
* 	prefect onload and onerror event.
*
*/

