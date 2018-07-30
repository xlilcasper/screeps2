var actionHandler = {
    actions: ['build', 'deliver', 'harvest','mine', 'pickupEnergy', 'pickupAnyEnergy', 'refillEnergy', 'repair','transfer', 'upgrade'],
    actionExists: function(action) {
        return _.indexOf(this.actions, action) > -1
    }
}
module.exports = actionHandler