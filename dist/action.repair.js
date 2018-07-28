var finder = require('finder')
var log = require('logManager')
/*
Picks up energy on the ground
 */
var Icons = require('icons');
var actionHarvest = {
    run: function(creep, role) {
        // We are full, can't pick up any
        if (creep.energy == 0)
            return false;
        //We never pickup energy
        if (role.pickup_range < 0)
            return false;
        var priorities={};
        if (creep.deliveryPriorities==undefined) {
            priorities[STRUCTURE_SPAWN]     = 10;
            priorities[STRUCTURE_EXTENSION] = 20;
            priorities[STRUCTURE_TOWER]     = 30;
            priorities[STRUCTURE_LINK]      = 40;
            priorities[STRUCTURE_STORAGE]   = 50;
            priorities[STRUCTURE_CONTAINER] = 60;
        } else {
            priorities = creep.deliveryPriorities;
        }
        //builds our priority que for targets.
        var priorityTargets = _.sortBy(_.filter(finder.findStructures(creep.room), function(s) {
            return s.is(priorities) && s.hits < s.hitsMax > 0
        }).map(function (s) {
            var priority = priorities[s.structureType] + creep.pos.getRangeTo(s)/100 - s.getDamagePercent()/20;
            return {
                id: s.id,
                priority: priority, damage: s.getDamage(),
                type: s.structureType
            }
        }), (s) => s.priority);
        priorityTargets=_.sortBy(priorityTargets, (s) => s.priority);

        _.each(priorityTargets, function (targetInfo) {
            let target = Game.getObjectById(targetInfo.id);
            creep.setTarget(target);
        });
        if (creep.repair(creep.target()) == ERR_NOT_IN_RANGE) {
            //this.showTarget(creep,targets[0].pos);
            creep.moveCloseTo(creep.target());
        } else {
            return false;
        }
        return true;
    }
};
module.exports = actionHarvest