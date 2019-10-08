var express = require('express');

var app = express();

app.get('/', (req, res, next) => {
    res.status(404).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});


module.exports = app;