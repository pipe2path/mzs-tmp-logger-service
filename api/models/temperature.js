/**
 * Created by kevin on 7/13/2017.
 */
function ReadingCelsius(data) {
    this.entityId = data.entityId;
    this.readingCelsius = data.readingCelsius;
    this.dateTimeStamp = data.dateTimeStamp;
}

module.exports = ReadingCelsius;