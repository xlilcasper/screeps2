var log = require('logManager');
var countType = require('countType');
var creepFactory = require('creepFactory');
var finder = require('finder')
var roomStatePrototype = require('room.state.prototype');

var roomState = {
    name: 'upgrade1',
    owned_tick:function(roomManager, room){
        if (room.hasSpawn()) {
            energyAvailable = Math.max(room.energyAvailable , 300);
            energyCapacity = room.energyCapacityAvailable * 0.75;
            sources = finder.findSources(room).length
            log.debug("Running state "+this.name+". Energy: "+energyAvailable+"/"+energyCapacity)
            harvesters = countType.count(room, 'harvester', false)
            roomManager.maintainCreeps(room, 'miner', energyAvailable, sources, harvesters, creepFactory.PRIORITY_HIGH);
            roomManager.maintainCreeps(room, 'minecart', energyAvailable, sources, 0, creepFactory.PRIORITY_MEDLOW);
            roomManager.maintainCreeps(room, 'upgrader', energyAvailable, 1, 0, creepFactory.PRIORITY_MED);

        } else {
            log.alert("Needs a spawn", "roomManager", room)
        }
    },
    nextState:function(room){
        harvesters = countType.count(room, 'harvester', false)
        miners = countType.count(room, 'miner', false)
        if (miners == 0 && harvesters == 0) {
            return 'easy'
        }
        if (Game.rooms['W2N2'].controller.level >= 3) {
            return 'build1'
        }
        return this.name
    }
}

module.exports = require('extends')(roomState, roomStatePrototype);