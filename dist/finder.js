/**
 * Created by Brian on 12/31/2016.
 */
//Will be used to cache finds
var log = require('logManager');

var finder = {
    buildPriority: {},
    box: function(room, key, objects) {
        if (key == 'flags') {
            this.flagBox(room, key, objects);
            return;
        }
        var array = []
        objects.forEach(function(o){
            array.push(o.id)
        })
        Memory[room.name + '-' + key] = array;
    },
    flagBox: function(room,key,objects) {
        var array = []
        objects.forEach(function(o){
            array.push(o.name)
        })
        Memory[room.name + '-' + key] = array;
    },
    unbox: function(room, key) {
        if (key == 'flags') {
            return this.flagUnbox(room,key);
        }
        var objects = []
        try {
            Memory[room.name + '-' + key].forEach(function(o){
                var thing = Game.getObjectById(o)
                if(thing) objects.push(thing)
            })
            if(_.size(objects) === 0) {
                this.findAll(room,Memory[room.name + '-' + key]==undefined)
            }
            return objects
        } catch(err) {
            log.error(err,"Finder");
            this.findAll(room, true)
        }
    },
    flagUnbox: function(room,key) {
        var objects = []
        try {
            Memory[room.name + '-' + key].forEach(function(o){
                var thing = Game.flags[o];
                if(thing) objects.push(thing)
            })
            if(_.size(objects) === 0) {
                this.findAll(room, true)
            }
            return objects
        } catch(err) {
            logError(err,"Finder");
            this.findAll(room, true)
        }
    },
    findEachTick: function(room) {
        this.buildPriority[STRUCTURE_TOWER]= 150;
        this.buildPriority[STRUCTURE_SPAWN]= 100;
        this.buildPriority[STRUCTURE_EXTENSION]=100;
        this.buildPriority[STRUCTURE_CONTAINER]= 100;
        this.buildPriority[STRUCTURE_STORAGE]= 100;
        this.buildPriority[STRUCTURE_RAMPART]= 80;
        this.buildPriority[STRUCTURE_WALL]= 80;
        this.buildPriority[STRUCTURE_ROAD]= 1;

        var creeps = room.find(FIND_CREEPS)
        var objs = _.filter(creeps, function(c) { return c.my })
        this.box(room, 'my-creeps', objs)
        objs = _.filter(creeps, function(c) { return !c.my })
        this.box(room, 'hostile-creeps', objs)
        objs = room.find(FIND_CONSTRUCTION_SITES)
        this.box(room, 'construction-sites', objs)
        objs = room.find(FIND_DROPPED_RESOURCES)
        this.box(room, 'dropped-resources', objs)
        objs = room.find(FIND_FLAGS)
        this.box(room, 'flags', objs)
    },
    findAll: function(room, force = false) {
        if (force) {
            log.warn("Find all was forced","Finder");
            log.warn(new Error().stack,"Finder");
        }
        this.findEachTick(room);
        if (Game.time % 100 === 0 || force) { //infrequent
            var objs = room.find(FIND_STRUCTURES)
            this.box(room, 'structures', objs)

        }
        if (Game.time % 5000 === 0 || force) { //almost never
            this.box(room, 'my-spawns', room.find(FIND_MY_SPAWNS))
            this.box(room, 'hostile-spawns', room.find(FIND_HOSTILE_SPAWNS))
            this.box(room, 'sources', room.find(FIND_SOURCES))
            this.box(room, 'minerals', room.find(FIND_MINERALS))
        }
    },
    findFlags: function(room) {
        /*
        var flags = this.unbox(room, 'flags')
        if(_.size(flags) === 0) {
            var objs = room.find(FIND_FLAGS)
            this.box(room, 'flags', objs);
            flags = objs
        }*/
        var flags = _.filter(Game.flags,function(f) {
            return f.room==room;
        })
        return flags
    },
    findAllFlags: function() {
        return Game.flags;
    },
    findRoads: function(room) {
        return _.filter(this.unbox(room, 'structures'), (s) => s.structureType === STRUCTURE_ROAD)
    },
    findMyConstructionSites: function(room) {
        return _.filter(this.unbox(room, 'construction-sites'), function(s){ return s.my })
    },
    findMyConstructionSitesType: function(room,structureType) {
        return _.filter(this.unbox(room, 'construction-sites'), function(s){ return s.my && s.structureType == structureType })
    },
    findStructureType: function(room, structureType) {
        return _.filter(this.unbox(room, 'structures'), function(s){ return s.structureType === structureType })
    },
    findMyStructures: function(room) {
        return _.filter(this.unbox(room, 'structures'), function(s){ return s.my })
    },
    findMyStructuresType: function(room,structureType) {
        return _.filter(this.unbox(room, 'structures'), function(s){ return s.my && s.structureType == structureType})
    },
    findStructures: function(room) {
        return this.unbox(room, 'structures')
    },
    findSources: function(room) {
        if(!room) return null
        return this.unbox(room, 'sources')
    },
    findSafeSources: function(room) {
        let safe = this.findSources(room).filter(
            function (source) {
                var range = 3;
                if (source.pos.findInRange(FIND_HOSTILE_CREEPS, range).filter((c) => !c.isFriend()).length > 0)
                return false;
                if (source.pos.findInRange(FIND_HOSTILE_SPAWNS, range).length > 0)
                    return false;
                if (source.pos.findInRange(FIND_HOSTILE_STRUCTURES, range).length > 0)
                    return false;
                if (source.pos.findInRange(FIND_HOSTILE_CONSTRUCTION_SITES, range).length > 0)
                    return false;
                return true;
            }
        );
        room.memory.safeSources=safe;
        return safe;
    },


    findSpawns: function(room){
        var target = room.find(FIND_MY_SPAWNS)
        return target
    },
    findAllSpawns: function(room){
        var target = room.find(FIND_MY_SPAWNS)
        return target;
    },

    findCreeps: function(role,room) {
        return _.filter(Game.creeps, (creep) => creep.memory.role === role && creep.memory.home === room.name);
    },
    findRoomCreeps: function(room) {
        return _.filter(Game.creeps, (creep) => creep.room === room);
    },
    findRoomHomeCreepsByName: function(roomName) {
        return _.filter(Game.creeps, (creep) => creep.getHome() === roomName);
    },
    hasHostals: function (room) {
        return this.countHostals(room) > 0
    },
    countHostals: function (room) {
        return _.size(this.findHostileCreeps(room));
    },
    findHostileCreeps: function(room) {
        return room.find(FIND_HOSTILE_CREEPS).filter(function(creep) {
            return !creep.isFriend();
        });
    },
    findStructureToRepair(room) {
        var targets = this.findStructures(room);
        targets = _.filter(targets,function(target) {
            var wallHits = target.hits<room.controller.level*10000;
            switch (target.structureType) {
                case STRUCTURE_RAMPART:
                case STRUCTURE_WALL:
                case STRUCTURE_ROAD:
                    return false;
                default:
                    return target.hits<target.hitsMax;
            }
        })
        var that=this;
        return _.sortBy(targets,function(e) {
            return that.buildPriority[e.structureType]*(e.hits/e.hitsMax);
        });
    },

    findSpawnMostEnergy: function() {
        return _.max(Game.spawns,function(s){
            return s.energy;
        });
    },
    isFriend: function(username) {
        if ( _.indexOf(Memory.IgnoreList,username)>=0)
            return true;
        return false;
    }
}

module.exports = finder;