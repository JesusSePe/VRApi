const express = require('express');
var path = require('path');

const app = express();
const port = process.env.PORT || 8000; 

// Root directory
app.get('/', (req, res) => {
    res.send("API Working");
});

// Crear un servidor web con express el el puerto asignado en la varible port.
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});