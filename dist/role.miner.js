var rolePrototype = require('role.prototype');
var log = require('logManager');
var repairAction = require('action.repair');
var finder = require('finder');
var roleMiner = {
    actions: ['mine'],
    max_body_size: 8,
    run: function(creep) {
      this._super_run(creep);
      // if we are 1 space away from a container, move onto it
        let container = _.filter(finder.findStructureType(creep.room, STRUCTURE_CONTAINER), function (s) {
            return creep.pos.getRangeTo(s) <= 1
        });

        if (creep.hasTarget()) {
            let targ = creep.target();
            if (container.length > 0 && creep.pos.getRangeTo(targ.pos.x, targ.pos.y)<=1) {
                creep.moveTo(container[0].pos.x, container[0].pos.y)
                if (creep.energy == creep.energyCapacity)
                    creep.repair(container[0]);
            }
        }
      //repairAction.run(creep, this);
    },
    getSpawnData: function() {
        let data = require('spawnData');
        data = Object.create(data)
        data.role='miner';
        data.body=[MOVE,CARRY, WORK];
        data.scale=[WORK];
        return data;
    },

}

module.exports = require('extends')(roleMiner, rolePrototype);