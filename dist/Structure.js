/**
 * Created by Brian on 1/12/2017.
 */
Structure.prototype.is=function(types) {
    if (Array.isArray(types))
        return _.indexOf(types,this.structureType)!=-1;
    return types[this.structureType] != undefined;
};

Structure.prototype.energyNeeded=function() {
    if (this.structureType==STRUCTURE_STORAGE || this.structureType==STRUCTURE_CONTAINER)
        return this.storeCapacity-this.store[RESOURCE_ENERGY];
    return this.energyCapacity-this.energy;
};

Structure.prototype.getEnergy=function() {
    if (this.structureType==STRUCTURE_STORAGE || this.structureType==STRUCTURE_CONTAINER)
        return this.store[RESOURCE_ENERGY];
    return this.energy;
};

Structure.prototype.getDamage=function() {
    return this.hitsMax - this.hits
}

Structure.prototype.getDamagePercent=function() {
    return this.getDamage() / this.hitsMax * 100
}