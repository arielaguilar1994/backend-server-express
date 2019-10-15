var express = require('express');

var app = express();

var authentication = require('../middlewares/authentication');
var Medico = require('../models/medico');

//============================================================
// Obtener todos los medicos
//============================================================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0; // si viene undefined coloca 0
    desde = Number(desde);

    Medico.find({})
        .skip(desde) //se salta lo que viene por query string 
        .limit(5) //y muestra 5
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, lstMedicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Ocurrio un error al obtener los Medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al obtener la cantidad de Medicos',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    lstMedicos,
                    total: conteo
                });
            });
        });
});


//============================================================
// Crear medico
//============================================================
app.post('/', authentication.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medicoDB
        });
    });
});

//============================================================
// Actualiar el medico
//============================================================
app.put('/:id', authentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: `No se encuentra un medico con el id: ${id}`,
                errors: { message: 'No se encontro el id del medico' }
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.img = body.img;
        medicoDB.usuario = req.usuario._id;
        medicoDB.hospital = body.hospital;

        medicoDB.save((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico
            });
        });
    });
});

//============================================================
// Eliminar el medico
//============================================================
app.delete('/:id', authentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el medico',
                errors: err
            });
        }

        if (!medicoDB) {
            return res.status(500).json({
                ok: false,
                mensaje: `No se encuentra un medico con el id: ${id}`,
                errors: { message: 'No se encontro el id del medico' }
            });
        }

        res.status(200).json({
            ok: true,
            medicoDB
        });
    });
});

module.exports = app;