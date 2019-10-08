var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var mdAutenticacion = require('../middlewares/authentication');

var Usuario = require('../models/usuario');

//============================================================
// Obtener todos los usuarios
//============================================================
app.get('/', (req, res, next) => {
    //las llaves es la forma de mandar una query en mongo, segundo parametro todo los campos que quiero traer
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio error al obtener usuario',
                        errors: err
                    })
                }

                res.status(200).json({
                    ok: true,
                    usuarios
                });
            });
});

//============================================================
// Middleware verificar token (todo lo que esta por debajo
// si este metodo no valida no permite el acceso a los otros)
// esto limita a q siempre valide y por ahi no necesites que se valide en todas
// por lo que se creo como una funcion a importar y colocar en cada peticion
//============================================================
// app.use('/', (req, res, next) => {
//     var token = req.query.token;

//     var token = jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'Token incorrecto',
//                 errors: err
//             });
//         }

//         next(); //esto es para que el token cuando valide continue con los sig metodos
//     });
// });


//============================================================
// Actualizar un nuevo usuario
//============================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con ${id} no existe`,
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

//============================================================
// crear un nuevo usuario
//============================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body; //esto funciona porque esta instalada body parser

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //esto muestra como encriptar en la librerias
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioCreador: req.usuario
        });
    });
});

//============================================================
// Borrar un usuario por el id
//============================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, userDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese Id',
                errors: { message: 'No existe un usuario con ese Id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: userDeleted
        });
    });
});

module.exports = app;