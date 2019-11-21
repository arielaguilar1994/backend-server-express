var express = require('express');

var app = express();

var authentication = require('../middlewares/authentication');

var Hospital = require('../models/hospital');

//============================================================
// Obtener todos los hospitales sin autenticar
//============================================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0; //viener por query de la sig form "{Entidad}?desde=5"
    desde = Number(desde)

    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Ocurrio un error al obtener los Hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al obtener la cantidad de hospitales',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });
            });
        });
});

//============================================================
// Obtener Hospital por ID
//============================================================
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospitalDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospitalDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El hospital con el id ${id} no existe`,
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalDB
            });
        })
});

//============================================================
// Crear un hospital
//============================================================

app.post('/', authentication.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospitalDB
        });
    });
});

//============================================================
// Metodo para actualizar el Hospital
//============================================================
app.put('/:id', authentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error obteniendo el hospital',
                errors: err
            });
        }

        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el ID: ${id} no existe`,
                errors: { message: 'No se encontro el Hospital' }
            });
        }

        hospitalDB.nombre = body.nombre;
        hospitalDB.img = body.img;
        hospitalDB.usuario = req.usuario._id

        hospitalDB.save((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital
            });
        });

    });
});

//============================================================
// Delete: Metodo para eliminar el hospital
//============================================================

app.delete('/:id', authentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error intentando eliminar el hospital',
                errors: err
            });
        }

        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el ID: ${id} no existe`,
                errors: { message: 'No se encontro el Hospital' }
            });
        }

        res.status(200).json({
            ok: true,
            hospitalDB
        });
    });
});

module.exports = app;