var log = require('logManager');
var countType = require('countType');
var creepFactory = require('creepFactory');
var roomStatePrototype = require('room.state.prototype')
var roomState = {
    name: 'early',
    owned_tick:function(roomManager, room){
        if (room.hasSpawn()) {
            energyAvailable = Math.max(room.energyAvailable , 300);
            log.debug("Running state early. Energy: "+energyAvailable)
            roomManager.maintainCreeps(room, 'harvester', energyAvailable, 1, 0, creepFactory.PRIORITY_NOW);
            roomManager.maintainCreeps(room, 'miner', energyAvailable, 1, 0, creepFactory.PRIORITY_MED);
            roomManager.maintainCreeps(room, 'minecart', energyAvailable, 1, 0, creepFactory.PRIORITY_MEDLOW);
        } else {
            log.alert("Needs a spawn", "roomManager", room)
        }
    },
    nextState:function(room){
        harvesters = countType.count(room, 'harvester', false)
        miners = countType.count(room, 'miner', false)
        minecarts = countType.count(room, 'minecart', false)
        if (harvesters >= 1 && miners >= 1 && minecarts >= 1) {
            return 'upgrade1'
        }
        return this.name
    }
}

module.exports = require('extends')(roomState, roomStatePrototype);