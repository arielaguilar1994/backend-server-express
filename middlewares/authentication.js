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