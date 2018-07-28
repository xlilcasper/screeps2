var finder = require('finder');
var log = require('logManager');

/*
Grabs some energy
 */
var action = {
    run: function(creep, role) {
        //Don't need energy if I have some
        if (creep.energyNeeded() == 0)
            return false;
        var priorities={};
        if (creep.refillPriorities==undefined) {
            priorities[STRUCTURE_LINK]      = 10;
            priorities[STRUCTURE_CONTAINER] = 20;
            priorities[STRUCTURE_STORAGE]   = 30;
        } else
            priorities=creep.refillPriorities;

        if (!creep.hasTarget()) {
            //builds our priority que for targets.
            let priorityTargets = _.sortBy(_.filter(finder.findStructures(creep.room), function(s) {
                    return s.is(priorities) && s.getEnergy() > 0
                }
            ).map(function (s) {
                let priority = priorities[s.structureType]+creep.pos.getRangeTo(s)/100;
                return {id: s.id, priority: priority}
            }), (s) => s.priority);
            _.each(priorityTargets, function (targetInfo) {
                let target = Game.getObjectById(targetInfo.id);
                creep.setTarget(target);
                //WE should filter so we all don't go to the same target to refill
                return false;
            });
        }
        if (!creep.hasTarget())
            return false;

        if (creep.withdraw(creep.target(),RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveCloseTo(creep.target());
        } else { //No place to withdraw from.
            creep.clearTarget();
            return false
        }
        return true;
    }
};
module.exports = action