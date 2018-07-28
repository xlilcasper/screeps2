var finder = require('finder')
/*
Harvest mines until full
 */
var actionHarvest = {
    run: function(creep, role) {
        if (creep.energyNeeded()==0 && creep.energyCapacity() > 0)
            return false;

        var source = Game.getObjectById(creep.memory.source);
        if (source == null) {
            source = this.getOpenSource(creep);
            if (!source)
                return;
            this.setSourceToMine(creep,source);
        }

        // var sources = finder.findSources(creep.room);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveCloseTo(source);
        }
        return true;
    },
    getOpenSource: function(creep)
    {
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
    setSourceToMine: function(creep, source)
    {
        if(!source)
            return;

        if(Memory.sources[source.id] == undefined)
            Memory.sources[source.id] = { id: source.id };

        Memory.sources[source.id].miner = creep.id;
        creep.memory.source = source.id;
    },
};
module.exports = actionHarvest