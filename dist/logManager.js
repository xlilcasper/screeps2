/*
 * @Author: Robert D. Cotey II <coteyr@coteyr.net>
 * @Date:   2016-06-26 06:00:56
 * @Last Modified by:   Brian Cobb
 * @Last Modified time: 2016-12-30 02:40:00
 */
//let Notify=require('notify');

var Log = {
    format: function(str) {
        var params = [];
        Array.prototype.push.apply(params,arguments);
        params.shift();
        if (!params.length)
            return str;
        var args = typeof params[0],
            args = (("string" == args || "number" == args) ? params : params[0]);
        for (var arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    },
    debug: function(message, tag, room, creep) {
        if (Memory.logLevel >= 5) this.buildMessage('ltgray', message, tag, room, creep)
    },
    info: function(message, tag, room, creep) {
        if (Memory.logLevel >= 4) this.buildMessage('blue', message, tag, room, creep)
    },
    warn: function(message, tag, room, creep) {
        if (Memory.logLevel >= 3) this.buildMessage('yellow', message, tag, room, creep)
        //if(room) Notify('Warning', message, 0, "https://screeps.com/a/#!/room/" + room.name)
    },
    error: function(message, tag, room, creep) {
        if (Memory.logLevel >= 2) this.buildMessage('red', message, tag, room, creep)
        //if(room) Notify('Error', message, 1, "https://screeps.com/a/#!/room/" + room.name)
    },

    critical: function(message, tag, room, creep) {
        if (Memory.logLevel >= 1) this.buildMessage('red', message, tag, room, creep)
        //if(room) Notify('Critical', message, 2, "https://screeps.com/a/#!/room/" + room.name)
    },
    alert: function(message, tag, room, creep) {
        this.buildMessage('purple', "<h1>" + message + "</h1>",tag, room, creep)
    },
    tick: function() {
        if (Memory.logLevel >= 0 && Memory.summary) {
            // console.log('<button style="background-color: #00DD00; color: #FFFFFF" onclick="listGoals()"> List Goals </button>')
            var cpuUsed = 0;
            if (Game.cpu.getUsed())
                cpuUsed = Game.cpu.getUsed().toFixed(2);
            var cpuLimit = 0;
            if (Game.cpu.limit)
                cpuLimit = Game.cpu.limit.toFixed(2);
            if(Game.time % 10 === 0 && Memory.longSummary) {
                var spawnSize = _.sum(_.map(Memory.rooms,(room) =>_.size(room.spawnQue)));

                var body = ""
                body += "<h2 style='width: 1000px;'>Summary for tick: <font color='#00DD00'>" + Game.time + "</font></h2>"
                body += "<hr/>"
                body += "<table style='width: 100%;'><tbody>"
                body += "<tr><th>CPU</th><td>" + cpuUsed + ' of ' + cpuLimit + "</td><td>" + this.progressBar(Game.cpu.getUsed(), Game.cpu.limit) + "</td></tr>"
                body += "<tr><th>Bucket</th><td>" + Game.cpu.bucket + ' of 10000' + "</td><td>" + this.progressBar(Game.cpu.bucket, 10000) + "</td></tr>"
                body += "<tr><th>GCL Progress</th><td>" + Game.gcl.progress.toFixed(2) + ' of ' + Game.gcl.progressTotal.toFixed(2) + "</td><td>" + this.progressBar(Game.gcl.progress,  Game.gcl.progressTotal) + "</td></tr>"
                body += "<tr><th>Spawn Queue</th><td>" + spawnSize + "</td><td></td></tr>"
                body += "<tr><th>Creep Count</th><td>" + _.size(Memory.creeps) + "</td><td></td></tr>"
                Object.keys(Game.rooms).forEach(function(key, index) {
                    var room = Game.rooms[key]
                    if(room.controller && room.controller.my) {
                        body += "<tr><td colspan='3' style='text-align: center'>Summary for " + room.name + "</td></tr>"
                        body += "<tr><th>Energy</th><td>" + room.energyAvailable + " of " + room.energyCapacityAvailable + "</td><td>" + Log.progressBar(room.energyAvailable, room.energyCapacityAvailable) + "</td></tr>"
                        body += "<tr><th>RCL Progress</th><td>" + room.controller.progress.toFixed(2) + " of " + room.controller.progressTotal.toFixed(2) + "</td><td>" + Log.progressBar(room.controller.progress, room.controller.progressTotal) + "</td></tr>"
                    }
                }, Game.rooms);
                body += "</tbody></table>"
                if(Memory.quite < Game.time) console.log(body)
            } else {
                if (Memory.rollingCPUAverage==undefined)
                    Memory.rollingCPUAverage=0;
                //ticks to average over
                var n = 30;
                Memory.rollingCPUAverage = Memory.rollingCPUAverage * (n-1)/n + cpuUsed / n;
                if(Memory.quite < Game.time) console.log(this.colorizer('ltgreen', 'TICK: ') + this.colorizer('yellow', Game.time + ' ')
                    + this.colorizer('ltgreen', 'CPU: ') + this.colorizer('yellow', cpuUsed + ' of ' + cpuLimit + ' ')
                    + this.colorizer('ltgreen',  'Bucket: ') + this.colorizer('yellow', Game.cpu.bucket+' ')
                    + this.colorizer('ltgreen',  'Avg: ') + this.colorizer('yellow', Memory.rollingCPUAverage.toFixed(2)))
                // if(Memory.quite < Game.time)   console.log(this.colorizer('ltgreen', 'Energy Harvested: ') + this.colorizer('yellow', Memory.harvest_this_tick + ' ') + this.colorizer('ltgreen', 'Average Energy Per Tick: ') + this.colorizer('yellow', Memory.harvest_average.toFixed(2)))
                //  if(Memory.quite < Game.time) console.log(this.colorizer('ltgreen', 'RCL Upgrade: ')      + this.colorizer('yellow', Memory.upgradeController_this_tick + ' ') + this.colorizer('ltgreen', 'Average RCL Per Tick: ') + this.colorizer('yellow', Memory.upgradeController_average.toFixed(2)))
            }
        }
    },
    progressBar: function(value, max,reverse=false) {
        var body = "<div style='border: 1px solid #FFFFFF; background-color: #3a3a3a; width: 100%;'>"
        var percentage = (value / max) * 100
        if (percentage>100)
            percentage=100;
        if (reverse)
            percentage=100-percentage;
        var color = '#35cd0b';
        if(percentage >= 10) color = '#98d814';
        if(percentage >= 25) color = '#e3c81f';
        if(percentage >= 50) color = '#ee7a2b';
        if(percentage >= 75) color = '#f93741';
        if (reverse)
            percentage=100-percentage;
        body += "<div style='text-align: center; border: 0px none; background-color: " + color + "; width: " + percentage + "%'>";
        body += "<span style='color: #222222; font-weight: bold'>" + percentage.toFixed(2) + "%</span>";
        body += "</div></div>";
        return body
    },

    buildMessage(color, message, tag, room, creep){
        var msg = ""
        if (room && room.name) msg += this.colorizer('ltgreen', "["+room.name + "] ")
        if (creep && creep.name) msg += this.colorizer('yellow', "["+creep.name + "] ")
        if (tag) msg += this.colorizer('green', "["+tag + "] ")
        msg += this.colorizer(color, message)
        if(Memory.quite < Game.time) console.log(msg)
    },
    colorizer(tcolor, message) {
        // ltgray  #a9b7c6
        // yellow #ffe56d
        // gray   #777777
        // red    #f93842
        // blue   #5d80b2
        // ltgreen  #65fd62
        // purple #b99cfb
        // white  #ffffff
        var color = '#A9B7C6'
        if(tcolor === 'yellow') color = "#FFE56D"
        if(tcolor === 'gray')   color = "#777777"
        if(tcolor === 'red')    color = "#F93842"
        if(tcolor === 'blue')   color = "#5D80B2"
        if(tcolor === 'green')  color = '#00FF00'
        if(tcolor === 'ltgreen')  color = '#65FD62'
        if(tcolor === 'purple') color = '#B99CFB'
        if(tcolor === 'while')  color = '#FFFFFF'
        return "<span style='color: " + color + ";'>" + message + "</span>"
    },
    initProfiler: function() {
        Memory.lastCPUUsed={};
        Memory.cpuMonitor={};
    },
    monitorCPU: function(id,start,tag,low,med,high) {
        if (Memory.lastCPUUsed==undefined)
            Memory.lastCPUUsed={};
        if(!global.PROFILE)
            return;
        var cpuUsed = Game.cpu.getUsed();
        if (start) {
            Memory.lastCPUUsed[id]=cpuUsed;
            return;
        }


        var used = cpuUsed-Memory.lastCPUUsed[id];
        Memory.cpuMonitor[id]={id:id,used: used};
        if (used>high)
            used = this.colorizer('red',used);
        else if (used>med)
            used = this.colorizer('yellow',used);
        if (used>low)
            this.debug("CPU Check "+used,tag);

        Memory.lastCPUUsed[id]=cpuUsed;
    },
    showProfile: function() {
        var sorted = _.sortBy(Memory.cpuMonitor,'used');
        var body = "<table>";
        for (var i in sorted) {
            var msg=sorted[i].used;
            if (sorted[i].used>10)
                msg = this.colorizer('red',msg);
            else if (sorted[i].used>5)
                msg = this.colorizer('yellow',msg);
            else if (sorted[i].used>1)
                msg = this.colorizer('green',msg);
            body += `<tr><td>${sorted[i].id} </td><td>${msg}</td></tr>`;
        }
        body+="</table>"
        console.log(body);
    }

}
module.exports = Log;