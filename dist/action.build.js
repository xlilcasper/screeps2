var finder = require('finder')
/*
Build near by structures
 */
var actionBuild = {
    run: function(creep, role) {
        //Must have energy to build
        if (creep.getEnergy() == 0) {
            return false
        }
        priorities={}
        if (creep.buildPriorities==undefined) {
            priorities[STRUCTURE_TOWER] = 10;
            priorities[STRUCTURE_RAMPART] = 20;
            priorities[STRUCTURE_WALL] = 30;
            priorities[STRUCTURE_SPAWN] = 40;
            priorities[STRUCTURE_EXTENSION] = 60;
            priorities[STRUCTURE_CONTAINER] = 50;
            priorities[STRUCTURE_STORAGE] = 70;
            priorities[STRUCTURE_ROAD] = 100;
        } else
            priorities=creep.buildPriorities;

        if (!creep.hasTarget()) {
            var priorityTargets = _.sortBy(_.filter(finder.findMyConstructionSites(creep.room), function (s) {
                    return s.is(priorities)
                }
            ).map(function (s) {
                return {id: s.id, priority: priorities[s.structureType]+s.pos.getRangeTo(this)/10}
            }), (s) => s.priority);
            if (priorityTargets.length > 0)
                creep.setTarget(priorityTargets[0]);
        }

        if (!creep.hasTarget()) {
            return false;
        }

        var result = creep.build(creep.target());
        if (result == ERR_NOT_IN_RANGE)
        {
            creep.moveCloseTo(creep.target());
            return true;
        } else if (result==OK) {
            return true;
        }
        creep.clearTarget();
        return false;

        return true;
    }
};
module.exports = actionBuild