var targeting = require('targeting')
var actionDeliver = {
    run: function(creep, role) {
        // Must have stuff to deliver
        if (creep.carry[RESOURCE_ENERGY]==0) {
            return false;
        }
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
        //Grab a target if needed
        //Find a target
        if (!creep.hasTarget()) {
            targeting.findDeliveryLocation(creep, priorities)
        }
        //No target, no delivery
        if (!creep.hasTarget()){
            return false;
        }

        //Deliver to target
        var result = creep.transfer(creep.target(), RESOURCE_ENERGY)
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveCloseTo(creep.target());
        } else if (result==ERR_FULL || result==OK) {
            creep.clearTarget();
        } else {
            //Not sure what happened
            creep.clearTarget();
            return false;
        }
        return true;
    }
};
module.exports = actionDeliver