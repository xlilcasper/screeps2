var rolePrototype = require('role.prototype');
var role = {
    actions: ['pickupEnergy', 'build', 'upgrade', 'refillEnergy', 'pickupAnyEnergy'],
    spawn_refill_min_energy: 300,
    getSpawnData: function() {
        data = require('spawnData');
        data.role='builder';
        data.body=[MOVE,CARRY,WORK];
        data.scale=[MOVE, CARRY, WORK];
        return data;
    }
}

module.exports = require('extends')(role, rolePrototype);