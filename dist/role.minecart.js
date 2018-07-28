var rolePrototype = require('role.prototype');
var log = require('logManager')
var roleMinecart = {
    actions: ['pickupEnergy', 'transfer', 'deliver'],
    pickup_range: 100, //rooms are 50x50 so this should mean anywhere
    max_body_size: 5,
    run: function (creep) {
        if (creep.state()==undefined)
            creep.setState(this.actions[0]);
        let action = require("action."+creep.state());
        action = Object.create(action);
        if (action.run(creep, this)) {
            if (creep.fatigue)
                this.buildRoadForMe(creep,false);
            return;
        }
        //Move to the next state
        let i = this.actions.indexOf(creep.state());
        i = (i+1) % this.actions.length;
        creep.setState(this.actions[i]);
    },
    getSpawnData: function() {
        let data = require('spawnData');
        data = Object.create(data);
        data.role='minecart';
        data.body=[MOVE,CARRY,CARRY];
        data.scale=[MOVE, CARRY];
        return data;
    },
}

module.exports = require('extends')(roleMinecart, rolePrototype);