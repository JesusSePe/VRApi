const express = require('express');
var path = require('path');
var mongoose = require('mongoose');
const app = express();
const port = 8000; 
const mongoDB = process.env.DATABASE_URL;
const expiration = process.env.TOKEN_EXPIRATION_TIME;

// Mongoose models
var user = require('./models/user').user;

// Mongo connection
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:' ));



// Root directory
app.get('/', (req, res) => {
    res.send("API Working");
});

// users directory
/*app.get('/users', async (req, res) => {
    const users = await user.find({});
    res.json(users);
});*/

// Crear un servidor web con express el el puerto asignado en la varible port.
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});