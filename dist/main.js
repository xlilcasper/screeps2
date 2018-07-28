
var RoomOverrides = require('Room');
var RoomObjectOverrides = require('RoomObject');
var StructureOverrides = require('Structure');
var ConstructionSiteOverrides = require('ConstructionSite');
var CreepOverrides = require('Creep');

var roomManager = require('roomManager')
var roleHandler = require('roleHandler');
var log = require('logManager');

Memory.logLevel = 5
Memory.quite = 0
global.WHOAMI = _.find(Game.structures).owner.username;
module.exports.loop = function () {
    //Cleanup our memory
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            log.debug('Clearing non-existing creep memory:' + name, "Main");
            console.log("This role died?: " + Memory.creeps[name].role);
            delete Memory.creeps[name];
        }
    }
    if (Game.time % 100 == 0) {
        //Clean up old rooms.
        for (var name in Memory.rooms) {
            if (Game.rooms[name] == null && _.indexOf(Memory.softClaimed, name) == -1) {
                delete Memory.rooms[name];
                log.info('Clearing old room cache ' + name, "Main");
            }
        }
    }
    roomManager.tick()
    roleHandler.runRoles();
}