// Requires (importacion de librerias)
var express = require('express');
var mongoose = require('mongoose');



//Inicializar variables (aca usamos las librerias)
var app = express();


//Conexion a bd desde la docu de mongoose muestra como hacerlo
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err; //detiene todo el proceso y no hace mas nada

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online')
});


//rutas de la api
app.get('/', (req, res, next) => {
    res.status(404).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});


//Escuchar peticiones
app.listen(3000, () => {
    //la sintaxis rara es para definir el color en la consola, el 32m es para sistituor el segundo parametro en color
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});