var finder = require('finder');
var log = require('logManager');
var creepFactory = require('creepFactory');
var countType = require('countType');


var roomManager = {
    getState: function(room) {
        roomState = require('room.state.'+room.memory.state)
        roomState = Object.create(roomState)
        return roomState
    },
    tick:function() {
        if (Memory.softClaimed == undefined)
            Memory.softClaimed = []
        var knownRooms = _.union(_.keys(Game.rooms), Memory.softClaimed);
        for (var i in knownRooms) {
            var roomName = knownRooms[i];
            var room = Game.rooms[roomName];
            if (room.memory.state == undefined)
                room.memory.state = 'early'
            finder.findAll(room);
            if (room != undefined) {
                roomState = this.getState(room)
                if (room.memory.state != room.memory.lastState)
                    roomState.enter(room)
                roomState.owned_tick(this, room)
                room.memory.lastState = room.memory.state
                room.memory.state = roomState.nextState(room);
                // if we changed states, clear memory
                if (room.memory.state != room.memory.lastState) {
                    roomState.exit(room)
                    if (room.memory[lastState] != undefined)
                        delete room.memory[room.memory.lastState]
                }
                creepFactory.tick(room)
            }

            this.rollingAverage(room, 'energy', room.energyAvailable, 50);
            if (room.energyAvailable > room.energyCapacityAvailable * .9) {
                if (room.memory.extraEnergy == undefined)
                    room.memory.extraEnergy = 0;
                room.memory.extraEnergy += 1;
            } else {
                room.memory.extraEnergy=0;
            }
            if (room.energyAvailable < room.energyCapacityAvailable * .5) {
                if (room.memory.lowEnergy == undefined)
                    room.memory.lowEnergy = 0;
                room.memory.lowEnergy += 1;
            } else {
                room.memory.lowEnergy=0;
            }
            if (Game.time % 10 == 0) {
                let last = room.memory.lastEnergy;
                if (last == undefined)
                    last=0
                room.memory.lastEnergy = this.getRollingAverage(room, 'energy')
                log.info("Energy - Extra: " + room.memory.extraEnergy + " Low: " +room.memory.lowEnergy + " Avg:"+room.memory.lastEnergy + "Delta: "+ (room.memory.lastEnergy - last), "RoomManager", room)
                log.info(this.report(room),"roomManager", room)
            }

        }
    },
    maintainCreeps: function(room, type, energy, min_count, count=0, priority=creepFactory.PRIORITY_MED) {
        count += countType.count(room, type);
        if (count < min_count) {
            log.debug("I need a " + type + " priority "+priority+" spending "+energy, "RoomManager", room);
            let role = require('role.'+type);
            role = Object.create(role);
            let data = role.getSpawnData();
            data.orgbody = data.body
            data.body  = role.getScaledBody(room, energy);
            creepFactory.addToQue(room, data, priority );
            count++;
        }
        return count
    },
    rollingAverage(room, id,value,ticks) {
        if (room.memory.rollingAverage==undefined)
            room.memory.rollingAverage={};
        if (room.memory.rollingAverage[id]==undefined)
            room.memory.rollingAverage[id]={id:id, used: 0};
        var start=room.memory.rollingAverage[id].used
        room.memory.rollingAverage[id].used = room.memory.rollingAverage[id].used * (ticks-1)/ticks + value / ticks;
    },
    getRollingAverage(room, id) {
        if (room.memory.rollingAverage==undefined)
            return 0;
        if (room.memory.rollingAverage[id]==undefined)
            return 0;
        return room.memory.rollingAverage[id].used
    },
    respawnRequest: function(creep) {
        let room = creep.room;
        let state = this.getState(room)
        state.respawnRequest(this, creep)
    },
    report: function(room) {

        let counts = {}
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (counts[creep.getRole()] == undefined)
                counts[creep.getRole()] = 1;
            else
                counts[creep.getRole()] += 1;
        }

        let creepRoles = `<tr>`;
        let i = 0;
        for (let role in counts) {
            i++
            creepRoles += `<td style="padding: 2px">${role}</td><td style="padding: 2px">${counts[role]}</td>`
        }
        creepRoles += `</tr>`;
        var body =
            `<table width="100%" border='1' cellpadding='3' style='font-size:10pt; border: 1px solid black; '>`+
            `<tr><th colspan="${i}" align="center">Room: <a href="#!/room/${room.name}">${room.name}</a></th><th colspan="${i}" align="center">State: ${room.memory.state}</th></tr>`;
        body += creepRoles;
        //build our table of roles and counts
        body += `</table>`;
        return body
    }
}



module.exports = roomManager;