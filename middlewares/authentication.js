var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

//============================================================
// Middleware verificar token (todo lo que esta por debajo
// si este metodo no valida no permite el acceso a los otros)
//============================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next(); //esto es para que el token cuando valide continue con los sig metodos

        // return res.status(200).json({
        //     ok: true,
        //     decoded
        // });
    });
};

//============================================================
// Verificar si es administrador
//============================================================

exports.verficaADMIN_ROLE = function(req, res, next) {
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }
};

//============================================================
// Verificar Admin o mismo usuario
//============================================================

exports.verifyAdminOMismoUsuario = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }
};