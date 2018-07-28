var rolePrototype = require('role.prototype');
var log = require('logManager')
var repairAction = require('action.repair')
var roleMiner = {
    actions: ['harvest'],
    max_body_size: 7,
    run: function(creep) {
      this._super_run(creep);
      repairAction.run(creep, this)
    },
    getSpawnData: function() {
        let data = require('spawnData');
        data = Object.create(data)
        data.role='miner';
        data.body=[MOVE,WORK,WORK];
        data.scale=[WORK];
        return data;
    },

}

module.exports = require('extends')(roleMiner, rolePrototype);