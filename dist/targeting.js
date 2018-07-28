/**
 * Created by Brian on 1/3/2017.
 */
let Finder=require('finder');
let Flags = require('flags');

var Targeting = {
    findStructureUnderneath: function(pos, structureType) {
        return pos.lookFor(structureType);
        /*
        var canidates = pos.findInRange(FIND_STRUCTURES, 0, {filter: function(e){
            return e.structureType === structureType
        }});
        if(_.size(canidates) > 0) return canidates[0]
        */
    },
    findRoadUnderneath: function(pos){
        //return this.findStructureUnderneath(pos, STRUCTURE_ROAD)
        return pos.lookFor(STRUCTURE_ROAD);
    },
    findRampartUnderneath: function(pos){
        //return this.findStructureUnderneath(pos, STRUCTURE_RAMPART)
        return pos.lookFor(STRUCTURE_RAMPART);
    },
    findDeliveryLocation: function(creep,priorities) {
        let mem = creep.room.memory;
        //builds our priority que for targets.
        var priorityTargets = _.sortBy(_.filter(Finder.findStructures(creep.room), function(s) {
            return s.is(priorities) && s.energyNeeded() > 0
        }).map(function (s) {
            var priority = priorities[s.structureType] + creep.pos.getRangeTo(s)/100;
            return {
                id: s.id,
                priority: priority, energyNeeded: s.energyNeeded(),
                type: s.structureType
            }
        }), (s) => s.priority);

        let creepPriority = 35;
        var creepsRequesting = _.filter(Finder.findRoomCreeps(creep.room),(c)=>c.isRequestingEnergy()).map(function (c){
            var priority = creepPriority + creep.pos.getRangeTo(c)/100;
            return {
                id: c.id,
                priority: priority, energyNeeded: c.carryCapacity-c.carry[RESOURCE_ENERGY],
                type: 'creep'}
        });

        priorityTargets =priorityTargets.concat(creepsRequesting);
        priorityTargets=_.sortBy(priorityTargets, (s) => s.priority);

        _.each(priorityTargets, function (targetInfo) {
            var target = Game.getObjectById(targetInfo.id);
            creep.setTarget(target);
            return false;
        });

    },
    findRefillLocation: function(creep,priorities) {
        let mem = creep.room.memory;
        //builds our priority que for targets.
        let priorityTargets = _.sortBy(_.filter(Finder.findStructures(creep.room), function(s) {
                return s.is(priorities) && s.getEnergy() >= creep.carryCapacity;
            }
        ).map(function (s) {
            let priority = priorities[s.structureType]+creep.pos.getRangeTo(s)/100;
            if (s.structureType==STRUCTURE_LINK && Flags.isTypeAt(Flags.FLAG_COLOR.energy.linkSend.filter,s.pos)) {
                priority=priorities[STRUCTURE_CONTAINER];
            }
            //adjust for range.
            priority += creep.pos.getRangeTo(s)/100;
            return {
                id: s.id,
                priority: priority,
                type: s.structureType
            }
        }), (s) => s.priority);

        _.each(priorityTargets, function (targetInfo) {
            let target = Game.getObjectById(targetInfo.id);
            if (mem.refill.que[target.id] == undefined)
                mem.refill.que[target.id] = 0;
            if (target.getEnergy()-mem.refill.que[target.id] >= 0) {
                creep.setTarget(target);
                return false;
            }
        });
    }
};

module.exports = Targeting;