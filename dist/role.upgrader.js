var rolePrototype = require('role.prototype');
var roleUpgrader = {
    actions: ['upgrade','refillEnergy'],
    spawn_refill_min_energy: 100,
    run: function(creep) {
        this._super_run(creep);
        if (creep.fatigue)
            this.buildRoadForMe(creep,false);
    },
    getSpawnData: function() {
        data = require('spawnData');
        data.role='upgrader';
        data.body=[MOVE,CARRY,WORK];
        data.scale=[WORK, CARRY, WORK, MOVE, WORK, CARRY, WORK, WORK, MOVE];
        return data;
    }
}

module.exports = require('extends')(roleUpgrader, rolePrototype);