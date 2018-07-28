/**
 * Created by Brian on 12/31/2016.
 */
var Finder = require('finder');

var flags = {
    FLAG_COLOR: {
        //COLOR_RED - Attack
        army: {
            color: COLOR_RED,
            secondaryColor: COLOR_RED,
            filter: {'color': COLOR_RED,'secondaryColor': COLOR_RED},
            attack: {
                color: COLOR_RED,
                secondaryColor: COLOR_RED,
                filter: {'color': COLOR_RED,'secondaryColor': COLOR_RED},
            },
            waypoint: {
                color: COLOR_RED,
                secondaryColor: COLOR_GREEN,
                filter: {'color': COLOR_RED,'secondaryColor': COLOR_GREEN},
            },
            guard: {
                color: COLOR_RED,
                secondaryColor: COLOR_YELLOW,
                filter: {'color': COLOR_RED,'secondaryColor': COLOR_YELLOW},
            },
            drain: {
                color: COLOR_RED,
                secondaryColor: COLOR_PURPLE,
                filter: {'color': COLOR_RED,'secondaryColor': COLOR_PURPLE},
            },
            scout: {
                color: COLOR_RED,
                secondaryColor: COLOR_WHITE,
                filter: {'color': COLOR_RED,'secondaryColor': COLOR_WHITE},
            },

        },
        //COLOR_PURPLE
        //COLOR_BLUE
        //COLOR_CYAN
        //COLOR_GREEN
        //COLOR_YELLOW - Energy
        energy: {
            color: COLOR_YELLOW,
            secondaryColor: COLOR_YELLOW,
            filter: {'color': COLOR_YELLOW,'secondaryColor': COLOR_YELLOW},
            linkSend: {
                color: COLOR_YELLOW,
                secondaryColor: COLOR_RED,
                filter: {'color': COLOR_YELLOW,'secondaryColor': COLOR_RED},
            },
            linkReceive: {
                color: COLOR_YELLOW,
                secondaryColor: COLOR_GREEN,
                filter: {'color': COLOR_YELLOW,'secondaryColor': COLOR_GREEN},
            }
        },
        //COLOR_ORANGE
        //COLOR_BROWN
        //COLOR_GREY
        //COLOR_WHITE

    },
    findGuardFlag: function(room) {
        //var flags = Finder.findFlags(room).filter(
        var flags = _.filter(Finder.findAllFlags(),this.FLAG_COLOR.army.guard.filter);
        return flags;
    },
    setGuardFlag: function(room,pos,name) {
        if (!name)
            name=this.getUniqueFlagName(room,"Guard");
        return room.createFlag(pos,name,COLOR_RED,COLOR_YELLOW);
    },
    findAttackFlag: function(room) {
        //var flags = Finder.findFlags(room).filter(
        var flags = _.filter(Finder.findAllFlags(),this.FLAG_COLOR.army.attack.filter);
        return flags;
    },
    findWaypointFlag: function(room) {
        var flags = Finder.findFlags(room).filter(this.FLAG_COLOR.army.waypoint.filter);
        return flags;
    },
    findDrainFlag: function(room) {
        var flags = _.filter(Game.flags,this.FLAG_COLOR.army.drain.filter);
        return flags;
    },
    flagIsFlagType: function(flag,type) {
        return flag.color == type.color && flag.secondaryColor == type.secondaryColor;
    },
    isScoutFlag: function(flag) {
        return this.flagIsFlagType(flag,this.FLAG_COLOR.army.scout);
    },
    isReserved: function(flag) {
        if (Memory.reservedFlags==undefined)
            Memory.reservedFlags={};
        var owner = Game.getObjectById(Memory.reservedFlags[flag.name]);
        return owner!=null;
    },
    reserveFlag: function(flag,id) {
        if (Memory.reservedFlags==undefined)
            Memory.reservedFlags={};
        Memory.reservedFlags[flag.name]=id;
    },
    getReservedFlags: function(id) {
        if (Memory.reservedFlags==undefined)
            return [];
        var flags=[];

        //ToDo: replace with a map and filter
        for (var i in Memory.reservedFlags) {
            if (Memory.reservedFlags[i]==id) {
                flags.push(Game.flags[i]);
            }
        }
        return flags;
    },
    getReserver: function(flag) {
        if (Memory.reservedFlags==undefined)
            return null;
        return Game.getObjectById(Memory.reservedFlags[flag.name]);
    },
    createFlagOfType(type,room,pos,name) {
        if (!name)
            name=this.getUniqueFlagName("Flag");
        room.createFlag(pos,name,type.color,type.secondaryColor);
    },
    setAttackFlag: function(room,pos,name) {
        if (!name)
            name=this.getUniqueFlagName("Guard");
        return this.createFlagOfType(this.FLAG_COLOR.army.attack,room,pos,name);
    },
    getUniqueFlagName: function(name) {
        var nameCount = 0;
        var name = null;
        while(name == null)
        {
            nameCount++;
            var tryName = name+nameCount;
            if(Game.flags[tryName] == undefined)
                name = tryName;
        }
        return name;
    },
    isTypeAt: function(type, pos) {
        return _.filter(pos.lookFor(LOOK_FLAGS),type).length>0;
    }

}

module.exports = flags;