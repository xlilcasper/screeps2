let Log = require('logManager');
let Targeting = require('targeting');
let Finder = require('finder');
let Icons = require('icons');
let IgnoreList = [];
Creep.prototype.vomit = '';
Creep.prototype.isCreep = true;

Creep.prototype.orignalMoveTo = Creep.prototype.moveTo;
Creep.prototype.moveTo = function (first, second, options) {
    if (this.hasPart(WORK) && this.hasSome()) {
        let road = Targeting.findRoadUnderneath(this.pos);
        if (road && road.hits < road.hitsMax) {
            this.repair(road);
            this.spout(Icons[STRUCTURE_ROAD]);
        }
    }
    return this.orignalMoveTo(first, second, options)
};

Creep.prototype.orignalSuicide = Creep.prototype.suicide;
Creep.prototype.suicide = function () {
    this.setRole('recycle');
};

Creep.prototype.orgAttack = Creep.prototype.attack;
Creep.prototype.attack=function(target) {
    if (target.isFriend())
        return false;
    this.orgAttack(target)
}

Creep.prototype.orgRangedAttack = Creep.prototype.rangedAttack;
Creep.prototype.rangedAttack=function(target) {
    if (target.isFriend())
        return false;
    this.orgRangedAttack(target)
}

Creep.prototype.orgRangedMassAttack = Creep.prototype.rangedMassAttack;
Creep.prototype.rangedMassAttack = function(target) {
    if (target.isFriend())
        return false;
    this.orgRangedMassAttack(target)
}


Creep.prototype.setRole = function (role) {
    this.memory.role = role;
};

Creep.prototype.hasSome = function () {
    return !this.isEmpty()
};

Creep.prototype.isEmpty = function () {
    return _.sum(this.carry) <= 0
};

Creep.prototype.tick = function () {
    if (this.hasTarget())
        this.spout(this.getTargetIcon());
    if (this.isRequestingEnergy())
        this.spout(Icons[Icons.NEED_ENERGY]);

    if (this.vomit && (this.memory.last_say !=this.vomit || Game.time%3==(this.memory.nameNumber%3))) {//&& this.memory.last_say !== this.vomit){
        this.say(this.vomit, true);
        this.memory.last_say = this.vomit
    }
    if (this.memory.lastEnergy == undefined)
        this.memory.lastEnergy = 0;
    let used = this.memory.lastEnergy - this.carry[RESOURCE_ENERGY];
    this.memory.lastEnergy = this.carry[RESOURCE_ENERGY];
    if (used >= 0) {
        this.memory.energyUsed = used;
    }

};

Creep.prototype.hasPart = function (part) {
    let doI = false;
    this.body.forEach(function (b) {
        if (b.type === part) doI = true
    });
    return doI
};
Creep.prototype.getRole = function () {
    return this.memory.role;
};
Creep.prototype.moveCloseTo = function (target, range = 0) {
    if (target == undefined) {
        Log.warn("No target given to moveCloseTo.", "Creep - " + this.getRole(), this.room, this);
        Log.warn(new Error().stack, "Creep");
        return;
    }

    if (target.x == undefined) {
        target = target.pos;
    }
    let x = target.x;
    let y = target.y;

    if (target.roomName == undefined)
        target.roomName = this.room.name;

    /*
     if (this.hasPart(CARRY) && _.sum(this.carry)<this.carryCapacity)
     this.pickup(this.pos.findInRange(FIND_DROPPED_ENERGY,1));
     */

    let distance = this.pos.getRangeTo(x, y);
    if (distance <= range) {
        //4 times out of 5 we exit here
        //lets us get near to target then slow
        //move in.
        if (Game.time % 5)
            return true;
    }

    if (this.fatigue) { // Don't do pathing if I can't even move
        Log.debug('Creep is too tired to move ', this.room, this);
        return false
    } else {
        let result = this.moveTo(target, {reusePath: distance});
        if (result) {
            this.spout(Icons[Icons.TARGET]);
            switch (result) {
                case ERR_NO_PATH:
                    this.spout(Icons[Icons.NO_PATH]);
                    break;
                case ERR_INVALID_TARGET:
                    this.spout(Icons[Icons.INVALID]);
                    break;
            }
        }//Log.warn("Could not move: " + result, this.room, this)
        return result
    }
};
Creep.prototype.progress = function (val, max) {
    let bar = [' ', '_', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    let amount = Math.floor((val / max) * 10);
    return bar[amount];
};
Creep.prototype.spoutProgress = function (val, max) {
    this.spout(this.progress(val, max));
};
Creep.prototype.spout = function (say) {
    if (!this.vomit.includes(say)) this.vomit += say
};
Creep.prototype.setState = function (state) {
    this.memory.state = state;
};
Creep.prototype.state = function () {
    if (this.memory.state)
        return this.memory.state;
    return null
};
Creep.prototype.clearState=function() {
    delete this.memory.state;
}

Creep.prototype.setHome = function (room) {
    if (room.name != undefined)
        room = room.name;
    this.memory.home = room;
};
Creep.prototype.getHome = function () {
    return this.memory.home;
};
Creep.prototype.isHome = function () {
    return this.getHome() == this.room.name;
};
Creep.prototype.getHomeRoom = function () {
    return Game.rooms[this.getHome()];
}
Creep.prototype.goHome = function () {
    if (this.isHome())
        return;
    this.spout(Icons[Icons.HOME]);
    let pos = new RoomPosition(24, 24, this.getHome());
    this.moveCloseTo(pos);
};

Creep.prototype.setSpawnRoom = function (room) {
    if (room.name != undefined)
        room = room.name;
    this.memory.spawnRoom = room;
};

Creep.prototype.getSpawnRoom = function () {
    return Game.rooms[this.memory.spawnRoom];
};

Creep.prototype.getSpawnRoomName = function () {
    return this.memory.spawnRoom;
};

Creep.prototype.isSpawnRoom = function () {
    return this.getSpawnRoomName() == this.room.name;
};

Creep.prototype.goToSpawn = function () {
    if (this.isSpawnRoom())
        return;
    this.spout('⍟');
    let pos = new RoomPosition(24, 24, this.getSpawnRoomName());
    this.moveCloseTo(pos);
};

Creep.prototype.idle=function() {
    this.spout(_.sample(["♩","♪","♫","♬","𝄽","𝅗𝅥","𝅘𝅥𝅯","𝅘𝅥𝅰","𝅘𝅥𝅱","𝅘𝅥𝅲"]));
}

Creep.prototype.energyNeeded = function() {
    return this.carryCapacity - this.carry[RESOURCE_ENERGY]
}

Creep.prototype.isFriend = function() {
    return Finder.isFriend(this.owner.username);
}

Creep.prototype.getEnergy = function() {
    return this.carry[RESOURCE_ENERGY];
}

Creep.prototype.isRequestingEnergy = function() {
    return this.memory.requestingEnergy;
}

Creep.prototype.requestEnergy =function(value=true) {
    this.memory.requestingEnergy=value;
};

Creep.prototype.energyCapacity = function() {
    return this.carry[RESOURCE_ENERGY]
}