var mongoose = require('mongoose');

var courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    subscribers: {
        teachers: Array,
        students: Array
    },
    elements: Array,
    tasks: Array,
    vr_tasks: [{
        ID: Number,
        title: String,
        descripcion: String,
        VRexID: Number,
        versionID: Number,
        pollID: Number,
        completions: [{
            studentID: Number,
            position_data: {data: String},
            autograde: {
                passed_items: Number,
                failed_items: Number,
                score: Number,
                comments: String
            },
            grade: Number,
            feedback: String
        }]
    }]

});

var course = mongoose.model('courses', courseSchema);

module.exports = {
    course: course
}