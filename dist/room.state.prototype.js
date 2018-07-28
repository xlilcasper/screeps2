var log = require('logManager');

var roomState = {
    name: 'prototype',
    enter: function (room) {
        log.debug("Entering room state "+this.name, "room.state."+this.name, room)
    },
    exit: function (room) {
        log.debug("Exiting room state "+this.name, "room.state."+this.name, room)
    },
    owned_tick:function(roomManager, room){},
    respawnRequest: function(roomManager, creep) {},
    nextState:function(room){ return this.name }
}

module.exports = roomState;