const express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cors = require('cors');
const app = express();
const port = process.env.PORT || 8000; 
const mongoDB = process.env.DATABASE_URL;
const expiration = process.env.TOKEN_EXPIRATION_TIME;

// Mongoose models
var user = require('./models/user').user;

// Functions
const hash = require('./functions/hash.js'); // Hashing functions
const moment = require('moment');
const { json } = require('express/lib/response');


// Mongo connection
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:' ));



app.use(express.json());    // Make express read application/json
app.use(cors());            // Add CORS to express

// Root directory
app.get('/', (req, res) => {
    res.send("API Working");
});

// users directory
/*app.get('/users', async (req, res) => {
    const users = await user.find({});
    res.json(users);
});*/

// login directory
app.get('/api/login', async (req, res) => {
    console.log(req);
    // retrieve user and password
    var usuari = req.body.usr;
    var contrasenya = req.body.pass;

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
                let exp_date = moment().add(expiration, 'seconds');
                status = "OK";
                message = "Login success";
                session_token = hash.sha265(usr.email + usr.password + hash.salt());
                user.findOneAndUpdate( { email: usr.email }, { "$set": { "session_token": session_token, "session_token_exp_date": exp_date }} ).exec();
                res.json({status: status, message: message, session_token: session_token});
            }
            // Password does not match
            else {
                message = "Wrong credentials"
                res.json({status: status, message: message});
            }
        }
        // Username not found
        else {
            console.log(usr.password);
            message = "Authentication error"
            res.json({status: status, message: message});
        }
    }
    // Username not sent
    else {
        message = "username is required";
        res.json({status: status, message: message});
    }
});

// Logout
app.get('/api/logout', async (req, res) => {
    // retrieve user token
    var tkn = req.body.session_token;

    // Default messages
    let status = "ERROR";
    let message = "";

    if (typeof(tkn) != "undefined") {

        let usr = await user.findOne({ session_token: tkn });

        if (usr != null) {

            console.log(moment(usr.session_token_exp_date).utc().valueOf());
            console.log(moment().utc().valueOf());

            if (moment(usr.session_token_exp_date).utc().valueOf() > moment().utc().valueOf()) {

                status = "OK";
                message = "Session successfully closed.";

                user.findOneAndUpdate( { session_token: tkn }, { "$set": { "session_token": null, "session_token_exp_date": null }} ).exec();

                res.json({status: status, message: message});

            }
            // Token is expired
            else {
                message = "Expired token"
                res.json({ status: status, message: message });
            }

        }
        // user token not found
        else {
            message = "invalid token"
            res.json({ status: status, message: message });
        }

    }
    // Token has not been sent
    else {
        message = "session_token is required."
        res.json({ status: status, message: message });
    }

});

// Crear un servidor web con express el el puerto asignado en la varible port.
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});