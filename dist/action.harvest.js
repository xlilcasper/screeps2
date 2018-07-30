var finder = require('finder');
var log = require('logManager');
var actionMiner = require('action.mine');
/*
Harvest mines until full
 */
var action = {
    run: function(creep, role) {
        if (creep.energyNeeded()==0 && creep.energyCapacity() > 0)
            return false;
        return actionMiner.run(creep, role)
    },
};
module.exports = require('extends')(action, actionMiner);