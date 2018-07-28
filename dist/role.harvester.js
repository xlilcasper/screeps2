var rolePrototype = require('role.prototype');
var roleHarvester = {
    actions: ['pickupEnergy', 'harvest','deliver'],
    getSpawnData: function() {
        let data = require('spawnData');
        data = Object.create(data)
        data.role='harvester';
        data.body=[MOVE,CARRY,WORK];
        return data;
    },
}

module.exports = require('extends')(roleHarvester, rolePrototype);