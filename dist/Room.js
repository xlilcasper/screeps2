/**
 * Created by Brian on 1/5/2017.
 */
var Finder = require('finder');
var Flags = require('flags');
var Log = require('logManager');

Room.prototype.hasSpawn = function() {
    return Finder.findSpawns(this).length>0;
}

Room.prototype.multiroomPathDistance = function(fromPos,toPos) {
    var fromKey = fromPos.x+"-"+fromPos.y+"-"+fromPos.roomName;
    var toKey = toPos.x+"-"+toPos.y+"-"+toPos.roomName;
    if (this.memory[fromKey+"-"+toKey] != undefined)
        return this.memory[fromKey+"-"+toKey];
    var currentRoom = fromPos;
    var currentCost = 0;
    var pathStartToEnd = this.findPath(fromPos,toPos);
    if (fromPos.roomName == toPos.roomName) {
        return pathStartToEnd.length;
    }
    var pathBetween = Game.map.findRoute(fromPos.roomName,toPos.roomName);
    var pathEndToStart = Game.rooms[toPos.roomName].findPath(toPos,fromPos);;
    var result = pathStartToEnd.length+pathBetween.length+pathEndToStart.length;
    this.memory[fromKey+"-"+toKey]=result;
    return result;
}

Room.prototype.getNeighbor = function(roomName,direction) {

}

Room.prototype.isExit = function(pos) {
    if (pos.x==0)
        return LEFT;
    if (pos.x==49)
        return RIGHT;
    if (pos.y==0)
        return TOP;
    if (pos.y==49)
        return BOTTOM;
    return false;
}

Room.prototype.nearExit=function(pos,range) {
    if (pos.x<range)
        return LEFT;
    if (pos.x>49-range)
        return RIGHT;
    if (pos.y<range)
        return TOP;
    if (pos.y>49-range)
        return BOTTOM;
    return false;
}

Room.prototype.hasAttackFlag = function() {
    return Flags.findAttackFlag(this).filter((f) => f.pos.roomName==this.name).length>0;
}

Room.prototype.halt=function(level,reason) {
    this.memory.haltLevel=level;
    this.memory.haltReason=reason;
}

Room.prototype.haltActive=function() {
    return this.memory.haltLevel>0;
}

Room.prototype.getHalt=function() {
    return this.memory.haltLevel;
}

Room.prototype.softClaim=function() {
    if (Memory.softClaimed==undefined)
        Memory.softClaimed=[];
    Memory.softClaimed.push(this.name);
    Memory.softClaimed=_.uniq(Memory.softClaimed);
    return true;
}

Room.prototype.isSoftClaimed=function() {
    return _.indexOf(Memory.softClaimed,this.name)!=-1;
}

Room.prototype.hasLog=function() {
    return this.memory.reportLog.length>0;
}

Room.prototype.clearRoomLog=function() {
    this.memory.reportLog=[];
}

Room.prototype.log=function(msg) {
    if (!Array.isArray(msg))
        msg=[msg];
    this.memory.reportLog.push(msg);
}

Room.prototype.showLog=function() {
    var maxCols = _.max(_.map(this.memory.reportLog,(lineArr)=> lineArr.length));
    var longestLine = _.max(_.map(this.memory.reportLog,function (lineArr)
    {
        let len=_.sum(lineArr,function(line){
            if (line.substring(0,1)=="<")
                return 0;
            return line.length;
        });
        return len
    }));

    let extraSpace=8

    let linesNeeded = longestLine-this.name.length+extraSpace;
    let leftLines = "═".repeat(linesNeeded/2);
    let rightLines = "═".repeat(linesNeeded/2);
    if (linesNeeded%2==1)
        rightLines+="═";
    let header = "╔"+leftLines+"["+Log.colorizer('ltgreen', this.name)+"]"+rightLines+"╗";

    linesNeeded = longestLine+extraSpace+2;
    leftLines = "═".repeat(linesNeeded/2);
    rightLines = "═".repeat(linesNeeded/2)
    if (linesNeeded%2==1)
        rightLines+="═";
    let footer = "╚"+leftLines+rightLines+"╝";

    var body="";
    body+="<table style='font-family:Courier, monospace;'>";
    body+="<tr><td colspan='"+(maxCols+2)+"'>"+header+"</td>";
    _.each(this.memory.reportLog,function(lineArray){

        var line = "<tr><td>║</td>";
        if (lineArray.length==0)
            return true;
        let colspan = ((maxCols-lineArray.length)+1)/lineArray.length;

        _.each(lineArray,function(item){
            line += `<td colspan="${colspan}">${item}</td>`
        });
        line+="<td>║</td></tr>";

        /*
        var line = "<tr>";
        _.each(lineArray,function(item){
            line += `<td style="padding: 0px">${item}</td>`
        });
        line +="</tr>";
        */
        //Add in our lines.)
        body+=line;
    });
    body+="<tr><td colspan='"+(maxCols+2)+"' >"+footer+"</td>";
    body+="</table>";
    console.log(body);
}

Room.prototype.historyLink=function(tick=Game.time) {
    return '<a href="https://screeps.com/a/#!/history/"+this.name+"?t="+tick>📆</a>';
}

Room.prototype.getDangerLevel=function(pos) {
    if (this.dangerLevel == undefined)
        this.dangerLevel = [];
    if (this.dangerLevel[Game.time]==undefined)
        this.dangerLevel[Game.time]=[];
    if (this.dangerLevel[Game.time][pos.x]==undefined)
        this.dangerLevel[Game.time][pos.x]=[];

    if (this.dangerLevel[Game.time][pos.x][pos.y]== undefined) {
        let creeps = pos.findInRange(FIND_CREEPS, 2, {
            filter: function(creep) {
                return creep.hasPart(ATTACK) || creep.my;
            }
        });
        let dangerValue = 0;
        for (let creep in creeps) {
            if (!creep.my)
                dangerValue += 2 / pos.getRangeto(creep);
            else
                dangerValue -= 1 - (pos.getRangeto(creep)/100);

        }
        this.dangerLevel[Game.time][pos.x][pos.y] = dangerValue;
    }
    return this.dangerLevel[Game.time][pos.x][pos.y];
}

Room.prototype.getExtraEnergy=function() {
    //We must have a storage container to have extra energy.
    if (this.storage==undefined)
        return 0;
    let energyToKeep = (this.energyCapacityAvailable*10);
    let energyHave = this.storage.getEnergy();
    return energyHave-energyToKeep;
}

Room.prototype.getEnergyNeeded=function() {
    return -this.getExtraEnergy();
}