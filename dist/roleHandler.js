/**
 * Created by Brian on 12/27/2016.
 */
var log = require('logManager');

var roleHandler = {
    roleExists: function(role){
        try
        {
            require("role." + role);
            return true;
        }
        catch(e)
        {
            log.warn("Missing role? "+role,"roleHandler");
            log.warn(e.stack,"roleHandler");
            return false;
        }
    },
    getRole: function(role) {
        if (!this.roleExists(role)) {
            log.error("Unknown role: "+role,"roleHandler");
            return false;
        }
        return require('extends')(require("role."+role),require('role.prototype'));
    },
    runRoles: function() {
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            //Skip no roles
            if (creep.memory.role == undefined)
                continue;
            let role = creep.memory.role;
            role=this.getRole(role);
            if (!role) {
                console.log("No role defined for "+creep.name);
                return;
            }

            role=Object.create(role);
            role.generateEvents(creep);

            if (creep.memory.onSpawned != undefined) {
                log.monitorCPU("RoleRun",true);
                try {
                    var cpu = Game.cpu.getUsed();
                    role.run(creep);

                } catch (e) {
                    log.error(e,"Role Handler",creep.room,creep)
                }
                log.monitorCPU("RoleRun",false,creep.name,.08,.1,.5);
            }
            creep.tick();
        }
    },
    getParts: function(room,role) {
        if (!this.roleExists(role)) {
            log.error("Role doesn't exist in getParts: "+role,"roleHandler");
            return [];
        }
        let roleObj = this.getRole(role);
        return roleObj.getParts(room);
    },
    getLevelParts: function(role,level) {
        if (!this.roleExists(role)) {
            log.error("Role doesn't exist in getLevelParts: "+role,"roleHandler");
            return [];
        }
        let roleObj = this.getRole(role);
        return roleObj.getLevelParts(level);
    },
    getLevel: function(room,role) {
        if (!this.roleExists(role)) {
            log.error("Role doesn't exist in getLevel: "+role,"roleHandler");
            return -1;
        }
        let roleObj = this.getRole(role);
        return roleObj.getLevel(room);
    },
};

module.exports = roleHandler;