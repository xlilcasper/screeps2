var rolePrototype = require('role.prototype');
var log = require('logManager');

var role = {
    actions: ['pickupEnergy', 'repair', 'upgrade', 'refillEnergy'],
    spawn_refill_min_energy: 300,
    runActions: function (creep) {
        this._super_runActions(creep);
    },
    getSpawnData: function() {
        data = require('spawnData');
        data.role='repair';
        data.body=[MOVE,CARRY,WORK];
        data.scale=[MOVE, CARRY, WORK];
        return data;
    }
}

module.exports = require('extends')(role, rolePrototype);