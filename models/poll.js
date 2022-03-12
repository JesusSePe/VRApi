var mongoose = require('mongoose');

var pollSchema = new mongoose.Schema({
    ID: String,
    title: String,
    description: String,
    target_vr_exercises: Array,
    questions: [{
        question_type: String,
        title: String,
        description: String,
        answer: String,
        options: [{
            optionID: Number,
            text: String
        }]
    }]
});

var poll = mongoose.model('polls', pollSchema);

module.exports = {
    poll: poll
}