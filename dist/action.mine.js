var finder = require('finder');
var log = require('logManager')
/*
Harvest mines until full
 */
var action = {
    run: function(creep, role) {
        var source = Game.getObjectById(creep.memory.source);
        if (source == null) {
            source = this.getOpenSource(creep);
            if (!source)
                return;
            this.setSourceToMine(creep,source);
        }

        // var sources = finder.findSources(creep.room);
        // Make sure the source has energy
        if (source.energy == 0)
            return false;

        creep.setTarget(source);

        let result = creep.harvest(source);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveCloseTo(source);
        } else if (result == OK) {
            creep.room.memory.energygain += creep.countPart(WORK) * 2;
        } else {
            log.debug("Mining: "+result, "action.mine", creep.room, creep)
        }

        return true;
    },
    getOpenSource: function(creep) {
        var source = creep.pos.findClosestByPath(FIND_SOURCES, {
            filter: function(source)
            {
                var range=3;
                //Only select safe sources
                if (source.pos.findInRange(FIND_HOSTILE_CREEPS,range).filter((c)=> !c.isFriend()).length>0)
                    return false;
                if (source.pos.findInRange(FIND_HOSTILE_SPAWNS,range).length>0)
                    return false;
                if (source.pos.findInRange(FIND_HOSTILE_STRUCTURES,range).length>0)
                    return false;
                if (source.pos.findInRange(FIND_HOSTILE_CONSTRUCTION_SITES,range).length>0)
                    return false;

                if (Memory.sources[source.id] == undefined ||
                    Memory.sources[source.id].miner == undefined ||
                    Memory.sources[source.id].miner == creep.id)
                    return true;

                if(Game.getObjectById(Memory.sources[source.id].miner) == null)
                    return true;
                return false;
            }
        });
        return source;
    },
    setSourceToMine: function(creep, source) {
        if(!source)
            return;

        if(Memory.sources[source.id] == undefined)
            Memory.sources[source.id] = { id: source.id };

        Memory.sources[source.id].miner = creep.id;
        creep.memory.source = source.id;
    },
};
module.exports = action