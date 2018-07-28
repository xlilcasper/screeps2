var log=require('logManager');
var roleHandler = require('roleHandler')
var finder = require('finder')
var factory = {
    PRIORITY_NOW:0,
    PRIORITY_HIGH:10,
    PRIORITY_MEDHIGH:25,
    PRIORITY_MED:50,
    PRIORITY_MEDLOW:75,
    PRIORITY_LOW:100,
    init: function(room) {
        if (room.memory.factoryInit != undefined)
            return;
        this.memory(room);
        room.memory.factoryInit = true;

    },
    memory: function(room) {
        if(room.memory.spawnQue == undefined)
            room.memory.spawnQue = [ ];
        if (Memory.sources == undefined)
            Memory.sources = {};
    },
    tick: function(room) {
        var spawns = finder.findSpawns(room);
        factory.spawnNextCreep(spawns[0])
    },
    addToQue: function(room,creep,priority=this.PRIORITY_MED) {
        this.init(room)
        this.memory(room)
        if (creep ==undefined) {
            log.error("Data can not be empty", "creepFactory", room)
            return
        }

        log.debug("Adding to que:"+creep.role+" with priority "+priority,"Factor",room);
        room.memory.spawnQue.push({priority: priority, data: creep});
        room.memory.spawnQue = _.sortBy(room.memory.spawnQue,function(c){
            return c.priority;
        })
    },
    spawnNextCreep: function(spawner)  {
        this.memory(spawner.room)
        var room = spawner.room
        if (room.memory.spawnQue.length==0)
            return;
        this.init(room)
        if (spawner == undefined || !spawner) {
            log.error("Spawn next failed. Spawn point does not exist: " + spawner, "buildingManager");
            return;
        }
        // Get the spawn information
        var data = room.memory.spawnQue[0].data;
        var spawnOK = this.canSpawn(spawner, data)
        if (spawnOK == OK) {
            if (this.spawnCreep(spawner, data)){
                room.memory.spawnQue.shift();
                return;
            }
        } else {
            if (spawnOK == ERR_NOT_ENOUGH_ENERGY || ERR_BUSY)
                return;
            log.warn("Unable to spawn "+data.role+" reason: "+spawnOK+ JSON.stringify(data))
        }
        if (spawnOK == OK || spawnOK == ERR_INVALID_ARGS || spawnOK == ERR_RCL_NOT_ENOUGH )
            room.memory.spawnQue.shift();
    },
    canSpawn: function(spawner, data) {
        return spawner.canCreateCreep(data.body)
    },
    spawnCreep: function(spawner, data) {
        role = data.role
        log.info("Trying to spawn "+role,"Factory");
        if (spawner == undefined || !spawner) {
            log.error("Spawning failed. Spawn point does not exist: "+spawn+","+{spawner,role,data},"Factory");
        }
        var manager = require('roleHandler');
        if (!manager.roleExists(role)) {
            log.error("Spawning failed. Role does not exist: "+role+","+{spawner,role,data},"Factory",spawner.room)
        }
        var body = data.body;

        if (data.home==undefined)
            data.home = spawner.room.name

        // build our memory
        if (data.memory==undefined) {
            memory = {}
        } else {
            memory = data.memory
        }

        memory.home = data.home
        memory.spawnRoom = spawner.room.name
        memory.role = data.role

        var nameCount = 0;
        var name = null;
        while(name == null)
        {
            nameCount++;
            let vers = 1;
            if (data.orgbody != undefined)
                vers = data.body.length - data.orgbody.length + 1

            var tryName = role + " "+nameCount+" v"+vers;
            if(Game.creeps[tryName] == undefined)
                name = tryName;
        }
        memory.nameNumber=nameCount;

        var newName = spawner.createCreep(data.body, name, memory)
        if (isNaN(parseInt(newName))) {
            log.info('Spawning new ' + log.colorizer('white',role) + ': ' + newName,"Factory",spawner.room);
            return true;
        }
        return false

    },
    spawnCost: function(parts) {
        var total = 0;
        for(var index in parts)
        {
            var part = parts[index];
            switch(part)
            {
                case MOVE:
                    total += 50;
                    break;
                case WORK:
                    total += 100;
                    break;
                case CARRY:
                    total += 50;
                    break;
                case ATTACK:
                    total += 80;
                    break;
                case RANGED_ATTACK:
                    total += 150;
                    break;
                case HEAL:
                    total += 250;
                    break;
                case CLAIM:
                    total += 600;
                    break;
                case TOUGH:
                    total += 10;
                    break;
            }
        }
        return total;
    },
    nextSpawnCost: function(spawner) {
        this.memory(spawner.room)
        if (spawner.room.memory.spawnQue.length == 0)
            return 0;
        return this.spawnCost(spawner.room.memory.spawnQue[0].data.body);
    },
    clearQue: function(room) {
        room.memory.spawnQue = []
    }
}
module.exports = factory