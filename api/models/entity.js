function Entity(data) {
    this.entityId = data.entityId;
    this.name = data.name;
    this.address = data.address;
    this.city = data.city;
    this.phone = data.phone;
    this.email = data.email;
    this.tempLimit = data.tempLimit;
    this.alertPhone = data.alertPhone;
    this.alertMsg = data.alertMsg;
}

module.exports = Entity;