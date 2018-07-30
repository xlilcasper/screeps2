var log = require('logManager');

var roomState = {
    name: 'prototype',
    max_body_size: 0,
    enter: function (room) {
        log.debug("Entering room state "+this.name, "room.state."+this.name, room)
    },
    exit: function (room) {
        log.debug("Exiting room state "+this.name, "room.state."+this.name, room)
    },
    owned_tick:function(roomManager, room){ room.memory.max_body_size = this.max_body_size; },
    respawnRequest: function(roomManager, creep) {},
    nextState:function(room){ return this.name },
    status:function(room) { return ""; }
}

module.exports = roomState;