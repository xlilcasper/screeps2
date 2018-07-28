/**
 * Created by Brian on 12/27/2016.
 */
var log=require('logManager');
var countType=require('countType');
let Icons = require('icons');
var actionHandler = require('actionHandler');
var creepFactory = require('creepFactory');
var roomManager = require('roomManager')

var rolePrototype = {
    actions: [],
    spawn_refill_min_energy: 300,
    pickup_range: 1,
    repair_range: 1,
    max_body_size: -1,
    //Default part list
    partSortRank: {
        TOUGH:1,
        MOVE: 2,
        CLAIM: 3,
        WORK: 4,
        CARRY: 5,
        ATTACK: 6,
        RANGED_ATTACK: 7,
        HEAL: 8
    },
    flagMove: false,
    announceMe: function (creep) {
        if (Memory.announce) {

        }
    },
    init: function(creep) {
        creep.memory.military = false;
    },
    runActions:function(creep) {
        for (let i in this.actions) {
            var action = this.actions[i];
            if (actionHandler.actionExists(action)) {
                action = require("action."+action);
                action = Object.create(action);
                if (action.run(creep, this)) {
                    return this.actions[i]
                }
            } else {
                log.error("Missing action: "+action, "rolePrototype.runActions",creep.room, creep)
            }
        }
        return '';
    },
    run: function(creep) { this.runActions(creep); },
    generateEvents(creep) {
        if (creep.memory.onPreSpawned==undefined) {
            this.onPreSpawn(creep);
            creep.memory.onPreSpawned=true;
        }
        if (creep.memory.onSpawned==undefined && creep.id != undefined) {
            this.onSpawn(creep);
            creep.memory.onSpawned=true;
        }
        if (creep.memory.onPostSpawned==undefined && Game.getObjectById(creep.id) != undefined) {
            this.onPostSpawn(creep);
            creep.memory.onPostSpawned=true;
        }
        if (creep.ticksToLive== 300)
            this.lowAge(creep);
        if (creep.ticksToLive==(creep.body.length*3))
            this.respawnTrigger(creep);
        if (creep.ticksToLive<=100)
            this.dieing(creep);
        if (creep.ticksToLive == 1) {
            this.beforeAge(creep);
            this.clearMem(creep);
        }
    },
    onPreSpawn: function(creep) { },
    onSpawn: function(creep) { },
    onPostSpawn: function (creep) { },
    beforeAge: function(creep) { },
    clearMem: function(creep) {
        delete Memory.creeps[creep.name]
    },
    respawnTrigger: function(creep) {
        creep.spout(Icons[Icons.RESPAWN])
        roomManager.respawnRequest(creep)
    },
    lowAge: function(creep) { },
    dieing: function(creep) { creep.spout(Icons[Icons.DYING]); },
    buildRoadForMe: function(creep,swampOnly) {
        var canBuild = creep.room.lookForAt(LOOK_STRUCTURES,creep.pos).length;
        canBuild += creep.room.lookForAt(LOOK_CONSTRUCTION_SITES,creep.pos).length;
        if (swampOnly != undefined && swampOnly) {
            var ground = creep.room.lookForAt(LOOK_TERRAIN,creep.pos);
            if (ground.indexOf('swamp') == -1)
                return false;
        }
        if (canBuild==0) {
            creep.pos.createConstructionSite(STRUCTURE_ROAD);
            log.info(`Building road at (${creep.pos.x},${creep.pos.y})`,undefined,creep.room,creep);
            return true;
        }
        return false;
    },
    rest: function(creep) {
        //don't count idle if worker halt is in effect.
        if (creep.room.memory.haltLevel>0)
            return;
        var idleIcons =["♺","♽","♺","♹","♸",
            "♷","♶","♵","♴","♳"]
        if (creep.memory.military)
            return;
        if (creep.memory.idleTime==undefined)
            creep.memory.idleTime=Game.time;
        if (creep.memory.idle==undefined)
            creep.memory.idle=0;
        if (creep.memory.idleTime+1==Game.time) {
            creep.memory.idle++;
            if (creep.memory.idle>10)
                creep.spout(idleIcons[Icons.creep.memory.idle-10])
        } else {
            creep.memory.idle=0;
        }
        if (creep.memory.idle>20) {
            creep.setRole('recycle');
        }
        creep.memory.idleTime=Game.time;
    },
    canBeRole: function(creep) {
        var body = creep.body
        for (var i in data.body) {
            var part = data.body[i]
            var idx = body.indexOf(part)
            if (idx == -1)
                return false;
            body.splice(idx, 1)
        }
        return true;
    },
    removeTargetFlag: function(creep) {
        var oldFlag = Game.flags[creep.name];
        if (oldFlag)
            oldFlag.remove();
    },
    showTarget: function(creep,pos) {
        var oldFlag = Game.flags[creep.name];
        if (pos == undefined)
            pos = creep.target();
        if (pos==undefined) {
            this.removeTargetFlag(creep);
            return;
        }

        if (oldFlag) {
            if (pos.x == oldFlag.x && pos.y == oldFlag.y) {
                return;
            }
            oldFlag.remove();
        }
        creep.room.createFlag(pos,creep.name,COLOR_GREEN,COLOR_GREEN);

    },
    getSpawnData: function() {
        var data = require('spawnData');
        return data;
    },
    getScaledBody: function(room, energy=-1) {
        if (energy==-1) {
            energy = room.energyCapacityAvailable * 0.75;
            log.debug("Energy missing, setting it to "+energy)
        }

        if (energy < 300)
            energy = 300;
        var data = this.getSpawnData()
        let body = data.body
        log.debug("Energy available: "+energy)

        let i = 0
        while (creepFactory.spawnCost(body) < energy - creepFactory.spawnCost([data.scale[i]])) {
            if (this.max_body_size>0 && body.length>= this.max_body_size)
                break
            body.push(data.scale[i])
            i = (i+1) % data.scale.length
        }
        return body
    },

};

module.exports = rolePrototype;