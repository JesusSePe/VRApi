
const moment = require('moment');
const hash = require('./hash.js'); // Hashing functions

// Mongoose models
const user = require('../models/user').user;
const course = require('../models/course').course;
const pin = require('../models/pin').pin;


module.exports = {

    login: async function(usuari, contrasenya, expiration) {
        // Results
        let status = "ERROR";
        let message = "";
        let session_token = "";

        // Check username
        if (typeof(usuari) != "undefined") {
            let usr = await user.findOne({ first_name: usuari });
            
            if (usr != null) {
                // Check password
                if (hash.sha265(contrasenya) == usr.password) {
                    let exp_date = moment().add(expiration, 'milliseconds');
                    status = "OK";
                    message = "Login success";
                    session_token = hash.sha265(usr.email + usr.password + hash.salt());
                    user.findOneAndUpdate( { email: usr.email }, { "$set": { "session_token": session_token, "session_token_exp_date": exp_date }} ).exec();
                    return({status: status, message: message, session_token: session_token});
                }
                // Password does not match
                else {
                    message = "Wrong credentials"
                    return({status: status, message: message});
                }
            }
            // Username not found
            else {
                message = "Authentication error"
                return({status: status, message: message});
            }
        }
        // Username not sent
        else {
            message = "username is required";
            return({status: status, message: message});
        }
    },

    logout: async function(tkn) {
        // Default messages
        let status = "ERROR";
        let message = "";

        if (typeof(tkn) != "undefined") {

            let usr = await user.findOne({ session_token: tkn });

            if (usr != null) {

                if (moment(usr.session_token_exp_date).utc().valueOf() > moment().utc().valueOf()) {

                    status = "OK";
                    message = "Session successfully closed.";

                    user.findOneAndUpdate( { session_token: tkn }, { "$set": { "session_token": null, "session_token_exp_date": null }} ).exec();

                    return({status: status, message: message});

                }
                // Token is expired
                else {
                    message = "Expired token"
                    return({ status: status, message: message });
                }

            }
            // user token not found
            else {
                message = "invalid token"
                return({ status: status, message: message });
            }

        }
        // Token has not been sent
        else {
            message = "session_token is required."
            return({ status: status, message: message });
        }
    },

    get_courses: async function(tkn) {
        // Default messages
        let status = "ERROR";
        let message = "";

        if (typeof(tkn) != "undefined") {

            let usr = await user.findOne({ session_token: tkn });

            if (usr != null) {

                if (moment(usr.session_token_exp_date).utc().valueOf() > moment().utc().valueOf()) {

                    status = "OK";
                    message = "Courses.";

                    let courses = await course.find({ $or: [{ "subscribers.teachers": usr.ID }, { "subscribers.students": usr.ID }]}, 'title description');

                    return({status: status, message: message, course_list: courses});

                }
                // Token is expired
                else {
                    message = "Expired token"
                    return({ status: status, message: message });
                }

            }
            // user token not found
            else {
                message = "invalid token"
                return({ status: status, message: message });
            }

        }
        // Token has not been sent
        else {
            message = "session_token is required."
            return({ status: status, message: message });
        }
    },

    courseDetails: async function(tkn, ID) {
        // Default messages
        let status = "ERROR";
        let message = "";

        if (typeof(tkn) != "undefined") {

            let usr = await user.findOne({ session_token: tkn });

            if (usr != null) {

                if (moment(usr.session_token_exp_date).utc().valueOf() > moment().utc().valueOf()) {

                    try {
                        let course_details = await course.findById(ID);
                        if (course_details != null) {

                            status = "OK";
                            message = "Courses.";

                            return({status: status, message: message, course: course_details});
                        } else {
                            message = "Course not found"
                            return({ status: status, message: message });
                        }                        
                    } catch {
                        message = "Course not found"
                        return({ status: status, message: message });
                    }
                    

                }
                // Token is expired
                else {
                    message = "Expired token"
                    return({ status: status, message: message });
                }

            }
            // user token not found
            else {
                message = "invalid token"
                return({ status: status, message: message });
            }

        }
        // Token has not been sent
        else {
            message = "session_token is required."
            return({ status: status, message: message });
        }
    },

    export: async function(usuari, contrasenya) {
        // Results
        let status = "ERROR";
        let message = "";

        // Check username
        if (typeof(usuari) != "undefined") {
            let usr = await user.findOne({ first_name: usuari });
            
            if (usr != null) {
                // Check password
                if (hash.sha265(contrasenya) == usr.password) {
                    status = "OK";
                    message = "Courses.";

                    let courses = await course.find();

                    return({status: status, message: message, course_list: courses});
                }
                // Password does not match
                else {
                    message = "Wrong credentials"
                    return({status: status, message: message});
                }
            }
            // Username not found
            else {
                message = "Authentication error"
                return({status: status, message: message});
            }
        }
        // Username not sent
        else {
            message = "username is required";
            return({status: status, message: message});
        }
    },

    pinRequest: async function(tkn, ID) {
        // Default messages
        let status = "ERROR";
        let message = "";

        // Check that user is defined
        if (typeof(tkn) == "undefined") {

            message = "session_token is required."
            return({ status: status, message: message });
        }

        // Check that taskID is defined
        if (typeof(ID) == "undefined") {
            message = "taskID is required."
            return({ status: status, message: message });
        }

        // Check if usr token exists
        var usr = await user.findOne({ session_token: tkn });

        if (usr == null) {

            message = "invalid token"
            return({ status: status, message: message });

        }

        // Check if usr token is still valid
        if (moment(usr.session_token_exp_date).utc().valueOf() < moment().utc().valueOf()) {

            message = "Expired token"
            return({ status: status, message: message });
        }
        
        // Check if user has already a pin
        let checkUsrPin = await pin.findOne({user_id: usr.ID}).exec();

        if (checkUsrPin != null) {
            status = "OK";
            message = "Pin";
            PIN = checkUsrPin.pin_number.toString();
            return ({status: status, message: message, PIN: PIN});
        }

        // Create and check that pin doesn't exist.
        var pinExists = true;
        while (pinExists) {
            // Create a token
            var hashPin = hash.pin();

            // Check that pin doesn't already exist
            let search = await pin.findOne({pin_number: hashPin}).exec();
            
            if (search == null) {
                pinExists = false;
            }
        }

        // get VRexID from courses
        let VRdata = await course.findOne( {vr_tasks: {$elemMatch: {ID: ID}}} ).exec();
        let VRtask = VRdata.vr_tasks.find(tasks => tasks.ID == ID);

        // Store data
        let saveData = await new pin({
            pin_number: hashPin,
            user_id: usr.ID,
            VRtaskID: VRtask.ID,
            VRexID: VRtask.VRexID,
            versionID: VRtask.versionID,
            expiration_date: moment()
        });

        saveData.save(function(err, doc) {
            if (err) return console.error(err);
        });
        
        status = "OK";
        message = "Pin";
        PIN = hashPin;
        return ({status: status, message: message, PIN: PIN});
    },

    startvr: async function(PIN, expiration) {
        // Default messages
        let status = "ERROR";
        let message = "";

        // Check that pin is defined
        if (typeof(PIN) == "undefined") {

            message = "pin is required."
            return({ status: status, message: message });
        }

        // Check if pin exists
        try {
            var pinData = await pin.findOne({ pin_number: parseInt(PIN) });
        } catch {
            var pinData = null;
        }

        if (pinData == null) {

            message = "invalid pin"
            return({ status: status, message: message });

        }

        // Check if pin is still valid
        if (moment(pinData.expiration_date).add(expiration, 'milliseconds').utc().valueOf() < moment().utc().valueOf()) {
            pin.find({pin_number:PIN}).remove().exec();
            message = "Expired pin"
            return({ status: status, message: message });
        }

        let usr = user.findOne({ ID: pinData.user_id }).exec();

        status = "OK";
        message = "VR exercise start";
        return ({status: status, message: message, username: usr.first_name, VRexerciseID: pinData.VRexID, minExerciseVersion: pinData.versionID});
    },

    endVR: async function(pin, autograde, VRexerciseID, exerciseVersion, position_data){
        // Default messages
        let status = "ERROR";
        let message = "";

        // Check that pin is defined
        if (typeof(PIN) == "undefined") {

            message = "pin is required."
            return({ status: status, message: message });
        }

        // Check that autograde is defined
        if (typeof(autograde) == "undefined") {

            message = "autograde is required."
            return({ status: status, message: message });
        }

        // Check that VRexerciseID is defined
        if (typeof(VRexerciseID) == "undefined") {

            message = "VRexerciseID is required."
            return({ status: status, message: message });
        }

        // Check that exerciseVersion is defined
        if (typeof(exerciseVersion) == "undefined") {

            message = "exerciseVersion is required."
            return({ status: status, message: message });
        }

        // Check that position_data is defined
        if (typeof(position_data) == "undefined") {

            message = "position_data is required."
            return({ status: status, message: message });
        }

        // Check if pin exists
        try {
            var pinData = await pin.findOne({ pin_number: parseInt(PIN) });
        } catch {
            var pinData = null;
        }

        if (pinData == null) {

            message = "invalid pin"
            return({ status: status, message: message });

        }

        // add exercise
        let newCompletion = {
            studentID: pinData.user_id, 
            position_data: position_data, 
            autograde: [{
                passed_items: autograde.passed_items, 
                failed_items: autograde.failed_items, 
                score: autograde.score, 
                comments: autograde.comments
            }]
        };

        let VRdata = await course.findOne( {vr_tasks: {$elemMatch: {ID: ID}}} ).exec();
        VRdata.vr_tasks.find(tasks => tasks.ID == ID).push(newCompletion);
        
        saveData.save(function(err, doc) {
            if (err) return console.error(err);
        });


        status = "OK";
        message = "Exercise data successfully stored";
        return ({status: status, message: message});
    }

}