/**
* presence //联系人
*/

model( "presence", {
}, {

    _init: function() {
        var self = this;
        self.data = self.data || {};
        self.set( self.data );
    },

    get: function(id) {
        return this.data[id];     
    },

    set: function(data) {
        var self = this;
        var status = {};
        for(var id in data) {
            var show = data[id], presence = "online";
            if(show  == "unavailable" || show == "invisible") {
                presence = "offline";
            }
            status[presence] = status[presence] || [];
            status[presence].push({id: id, show: show});
        }
        for( var key in status ) {
            self.trigger(key, [status[key]]);
        }
    },

    clear: function() {
        var self = this;
        self.data = [];      
    }

});

