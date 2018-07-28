var finder = require('finder')
/*
Upgrades our room
 */
var actionHarvest = {
    run: function(creep, role) {
        //We have no energy so we can't upgrade
        if (creep.getEnergy() == 0)
            return false;
        var result = creep.upgradeController(creep.room.controller);
        if (result == ERR_NOT_IN_RANGE) {
            creep.moveCloseTo(creep.room.controller);
        }
        return true;
    }
};
module.exports = actionHarvest