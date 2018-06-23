function Entity(data) {
    this.entityId = data.entityId;
    this.name = data.name;
    this.address = data.address;
    this.city = data.city;
    this.phone = data.phone;
    this.email = data.email;
    this.alertTemp = data.alertTemp;
    this.alertPhone = data.alertPhone;
    this.alertMsg = data.alertMsg;
    this.alertFlag = data.alertFlag;
    this.timeOffset = data.timeOffset;
    this.alertSMSLastSent = data.alertSMSLastSent;
}

module.exports = Entity;