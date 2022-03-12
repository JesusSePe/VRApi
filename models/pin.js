var mongoose = require('mongoose');

var pinSchema = new mongoose.Schema({
    pin_number: Number,
    user_id: Number,
    exercise_id: Number,
    expiration_date: Date // https://mongoosejs.com/docs/schematypes.html#dates
});

var pin = mongoose.model('pins', pinSchema);

module.exports = {
    pin: pin
}