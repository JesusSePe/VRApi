var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    ID: Number,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    session_token: String,
    session_token_exp_date: Date, // https://mongoosejs.com/docs/schematypes.html#dates
});

var user = mongoose.model('Users', userSchema);

module.exports = {
    user: user
}