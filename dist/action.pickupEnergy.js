var finder = require('finder')
var log = require('logManager')
/*
Picks up energy on the ground
 */
var Icons = require('icons');
var action = {
    run: function(creep, role) {
        // We are full and don't need energy
        if (creep.energyCapacity() == creep.energy)
            return false;

        var dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES,{
            filter: function(e) {
                if (e.resourceType !== RESOURCE_ENERGY)
                    return false;
                var range = creep.pos.getRangeTo(e.pos.x, e.pos.y);
                return e.energy > 10 && range <= role.pickup_range
            }
        });

        if (dropped) {
            creep.spout(Icons[Icons.DROPPED_ENERGY]);
            var result = creep.pickup(dropped);
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveCloseTo(dropped);
            } else if (result==OK ||result == ERR_FULL) {
                return false;
            }
        } else {
            return false;
        }

        return true;
    }
};
module.exports = action;