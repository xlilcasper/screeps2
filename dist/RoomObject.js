/**
 * Created by Brian on 1/3/2017.
 */
var Log = require('logManager');
let Icons = require('icons');

RoomObject.prototype.setTarget = function(target) {
    if(target && target.id){
        this.memory.target = target.id
        delete this.memory.there
    } else if(target) {
        //we need to store type and name to get it back
        if (target.structureType && target.name) {
            this.memory.target = {type: target.structureType, name: target.name}
            return;
        } else if (target.color) {
            this.memory.target = {type: 'flag', name: target.name}
            return;
        }

        Log.error(this.name + " in " + this.room.name + ": Set Target expects and object with an id! Got: " + JSON.stringify(target))
        Log.error(new Error.stack());
    }
}

RoomObject.prototype.target = function() {
    if(this.memory.target) {
        if (this.memory.target.type) {
            switch (this.memory.target.type) {
                case STRUCTURE_SPAWN:
                    return Game.spawns[this.memory.target.name];
                case 'flag':
                    return Game.flags[this.memory.target.name];
                default:
                    return null;
            }
        }
        return Game.getObjectById(this.memory.target)
    } else {
        return null
    }
}
RoomObject.prototype.clearTarget = function() {
    delete this.memory.target
    delete this.memory.there
}
RoomObject.prototype.hasTarget = function() {
    if(this.memory.target) {
        if(this.target() != undefined && this.target() != null){
            return true
        } else {
            this.clearTarget();
            return false
        }
    } else {
        return false
    }
}
RoomObject.prototype.needsTarget = function() {
    return !this.hasTarget()
}

RoomObject.prototype.getTargetIcon = function() {
    if (!this.hasTarget())
        return Icons[Icons.NO_TARGET];
    var target = this.target();
    if (target.structureType != undefined) {
        //We are a building
        var icon = '';
        if (target.progress  != undefined) {
            //We are a constuction site.
            icon=Icons[Icons.CONSTRUCTION];
        }
        icon += Icons[target.structureType];
        return icon;
    } else {
        //We must be a creep or flag
        if (target.hits != undefined) {
            return Icons[Icons.CREEP];
        } else if (target.color != undefined) {
            //We must be a flag
            return Icons[Icons.FLAG];
        }
    }
    return '';
}