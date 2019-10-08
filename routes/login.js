var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken')

var app = express();

var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar un usuario",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales invalidas - email",
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales invalidas - pass",
                errors: err
            });
        }

        usuarioDB.password = ':)';
        //Crear un toquen
        // el primer parametro es la informacion que va a ir en el token segundo es el SEED y tercer la fecha de expiracion
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //esto son 4hs

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token
        });
    });
});

module.exports = app;