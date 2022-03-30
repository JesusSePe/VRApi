var mongoose = require('mongoose');

var pinSchema = new mongoose.Schema({
    pin_number: Number,
    user_id: Number,
    VRtaskID: Number,
    VRexID: Number,
    versionID: Number,
    expiration_date: Date // https://mongoosejs.com/docs/schematypes.html#dates
});

var pin = mongoose.model('pins', pinSchema);

module.exports = {
    pin: pin
}