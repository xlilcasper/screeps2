/**
 * Created by bjcobb on 1/12/2017.
 */
ConstructionSite.prototype.is= function(types) {
    if (Array.isArray(types))
        return _.indexOf(types,this.structureType)!=-1;
    return types[this.structureType] != undefined;
};