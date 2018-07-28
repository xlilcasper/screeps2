var log = require('logManager')
var countType = {
    refresh: function (room) {
        if (room.memory.lastCountRefresh==undefined)
            room.memory.lastCountRefresh=0;

        //if (room.memory.lastCountRefresh + 5 > Game.time)
        //    return

        room.memory.lastCountRefresh = Game.time;

        //get the creeps, filter by room
        var creeps = _.filter(Game.creeps, function (c) {
            return c.getHome() == room.name;
        });
        var counts={}
        for (var i in creeps) {
            var role = creeps[i].memory.role;
            if (counts[role] == undefined)
                counts[role] = 0;
            counts[role]++;
        }
        room.memory.creepCounts = counts
    },
    count: function(room, type, countQue=true) {
        this.refresh(room);
        count=0;
        if (room.memory.creepCounts[type]==undefined)
            count = 0;
        else
            count = room.memory.creepCounts[type];

        var spawns = room.find(FIND_MY_SPAWNS, {
            filter: function (spawn) {
                return (spawn.room == room);
            }
        });

        for (var i in spawns) {
            var spawn = spawns[i];
            if (spawn.spawning !== null
                && spawn.spawning !== undefined
                && Memory.creeps[spawn.spawning.name].role == type
                && Memory.creeps[spawn]) {
                count++;
            }
        }
        //Add in things in the que
        if (countQue) {
            if (room.memory.spawnQue != undefined) {
                count += room.memory.spawnQue.filter(function (qued) {
                    return qued.data.role == type;
                }).length;
            }
        }
        return count
    }

};
module.exports = countType;