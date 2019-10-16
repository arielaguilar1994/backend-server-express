var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//GOOGLE
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var app = express();

var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

//============================================================
// Authenticacion Google
//============================================================
//el async es simplemente una promesa
async function verify(token) {
    //await dice espera hasta que esto resuelva
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
verify().catch(console.error);


app.post('/google', async(req, res) => {
    //para que el await funcione le agrego el async arriba
    var token = req.body.token;
    var googleUsr = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });


    Usuario.findOne({ email: googleUsr.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar un usuario",
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe de utilizar su autenticacion normal",
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //esto son 4hs

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token
                });
            }
        } else {
            // si el usuario no se autentico hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUsr.nombre;
            usuario.email = googleUsr.email;
            usuario.img = googleUsr.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al guardar el usuario",
                    errors: err
                });

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //esto son 4hs

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token
                });
            });
        }

    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!',
    //     googleUser: googleUsr
    // });
});

//============================================================
// Authenticacion normal
//============================================================
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