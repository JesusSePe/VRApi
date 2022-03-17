
const moment = require('moment');
const hash = require('./hash.js'); // Hashing functions

// Mongoose models
const user = require('../models/user').user;
const course = require('../models/course').course;


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
                        let courses = await course.findById(ID);
                        if (courses = null) {

                            status = "OK";
                            message = "Courses.";

                            return({status: status, message: message, course_list: courses});
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
    }
}