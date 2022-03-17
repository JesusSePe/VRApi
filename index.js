const express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cors = require('cors');
const app = express();
try {  
    const env = require('./config.json');
} catch {
    env = undefined;
}
const port = process.env.PORT || 8000; 
const mongoDB = process.env.DATABASE_URL || env.DB_URL;
const expiration = process.env.TOKEN_EXPIRATION_TIME || env.EXP_TIME;


// Functions
const moment = require('moment');
const endpoints = require('./functions/endpoints');


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

// login directory
app.get('/api/login', async (req, res) => {
    // retrieve user and password
    var usuari = req.query.username;
    var contrasenya = req.query.password;

    res.json(await endpoints.login(usuari, contrasenya, expiration));
});

// Logout
app.get('/api/logout', async (req, res) => {
    // retrieve user token
    var tkn = req.query.session_token;

    res.json(await endpoints.logout(tkn));

});

// Get courses
app.get('/api/get_courses', async (req, res) => {
    // retrieve user token
    var tkn = req.query.session_token;

    res.json(await endpoints.get_courses(tkn));

});

// Get course by ID
app.get('/api/get_course_details', async (req, res) => {
    // retrieve user token
    var tkn = req.query.session_token;
    var ID = req.query.courseID;

    res.json(await endpoints.courseDetails(tkn, ID));

});

// Export Courses DB Data
app.get('/api/export_database', async (req, res) => {
    // retrieve user and password
    var usuari = req.query.username;
    var contrasenya = req.query.password;

    res.json(await endpoints.export(usuari, contrasenya));

});

// Crear un servidor web con express el el puerto asignado en la varible port.
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});