var log = require('logManager');
var countType = require('countType');
var creepFactory = require('creepFactory');
var finder = require('finder');
var roomStatePrototype = require('room.state.prototype');

var roomState = {
    name: 'build1',
    max_body_size: 12,
    owned_tick:function(roomManager, room){
        this._super_owned_tick(roomManager, room);
        if (room.hasSpawn()) {
            if (room.memory[this.name] == undefined) {
                room.memory[this.name] = {};
                room.memory[this.name].upgraders = 1;
                room.memory[this.name].coolDown = 0
            }
            if (room.memory[this.name].coolDown == undefined)
                room.memory[this.name].coolDown = 0;

            if (Game.time > room.memory[this.name].coolDown) {
                if (room.memory.extraEnergy > 50) {
                    room.memory[this.name].upgraders += 1;
                    room.memory[this.name].coolDown = Game.time + 100;
                    log.info("Extra energy, increasing builders", "room.state.build1", room);
                }
                if (room.memory.lowEnergy > 50) {
                    room.memory[this.name].upgraders = Math.max(1, room.memory[this.name].upgraders-1);
                    room.memory[this.name].coolDown = Game.time + 100;
                    log.info("Low energy, decreasing builders", "room.state.build1", room);
                }
            }


            energyAvailable = Math.max(room.energyAvailable , 300);
            energyCapacity = room.energyCapacityAvailable;
            sources = finder.findSources(room).length
            builders = countType.count(room,'builder',false)
            //log.debug("Running state "+this.name+". Energy: "+energyAvailable+"/"+energyCapacity + " builders: " + room.memory[this.name].upgraders + "/" + builders + " Check in "+ (room.memory[this.name].coolDown - Game.time));
            harvesters = countType.count(room, 'harvester', false);
            energyCapacity = energyCapacity *.90 //Save 10%
            roomManager.maintainCreeps(room, 'miner', energyCapacity, 1, 0, creepFactory.PRIORITY_NOW);
            roomManager.maintainCreeps(room, 'miner', energyCapacity, sources, harvesters, creepFactory.PRIORITY_HIGH);
            roomManager.maintainCreeps(room, 'minecart', energyCapacity, sources, 0, creepFactory.PRIORITY_MEDHIGH);
            builders_needed = Math.max(room.memory[this.name].upgraders,1);
            roomManager.maintainCreeps(room, 'builder', energyCapacity, builders_needed, 0, creepFactory.PRIORITY_MED);
            roomManager.maintainCreeps(room, 'upgrader', energyCapacity, 1, 0, creepFactory.PRIORITY_MED);
            roomManager.maintainCreeps(room, 'repair', energyCapacity, 1, 0, creepFactory.PRIORITY_LOW);
        } else {
            log.alert("Needs a spawn", "roomManager", room)
        }
    },
    respawnRequest: function(roomManager, creep) {
        this._super_respawnRequest(creep);
        let role = creep.getRole();
        log.debug("Respawn request for "+role, "rorom.state.build1", creep.room, creep)
        if (role != 'harvester') {
            energyCapacity = creep.room.energyCapacityAvailable *.90 //Save 10%
            roomManager.maintainCreeps(creep.room, role, energyCapacity, 1, 0, creepFactory.PRIORITY_MED);
        }
    },
    nextState:function(room){
        harvesters = countType.count(room, 'harvester', false)
        miners = countType.count(room, 'miner', false)
        if (miners == 0 && harvesters == 0) {
            if (room.memory[this.name].stateDropCoolDown == undefined) {
                room.memory[this.name].stateDropCoolDown = Game.time + 50;
            } else if (room.memory[this.name].stateDropCoolDown < Game.time) {
                return 'early'
            }
            return this.name;
        }
        if (room.memory[this.name].stateDropCoolDown != undefined) {
            delete room.memory[this.name].stateDropCoolDown
        }
        if (Game.rooms['W2N2'].controller.level < 3) {
            return 'upgrade1';
        }
        return this.name
    },
    status: function(room) {
        energyAvailable = Math.max(room.energyAvailable , 300);
        energyCapacity = room.energyCapacityAvailable;
        let status = "Energy: "+energyAvailable+"/"+energyCapacity + " builders: " + room.memory[this.name].upgraders + "/" + builders + " Check in "+ (room.memory[this.name].coolDown - Game.time);
    }
}

module.exports = require('extends')(roomState, roomStatePrototype);