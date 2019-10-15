var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//============================================================
// busqueda por coleccion
//============================================================
app.get('/collection/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regBusqueda = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla.toUpperCase()) {
        case 'HOSPITALES':
            promesa = buscarHospitales(busqueda, regBusqueda);
            break;
        case 'MEDICOS':
            promesa = buscarMedicos(busqueda, regBusqueda);
            break;
        case 'USUARIOS':
            promesa = buscarUsuarios(busqueda, regBusqueda);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: `No se encuentra un nombre de collection ${tabla}`,
                err: { message: 'Tipo de colleccion no valida' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data //lo que le dice a EcmaScript6 es que imprima el resultado
        });
    });

    // if (tabla.toUpperCase() === ) {
    //     buscarHospitales(busqueda, regBusqueda).then(hospitales => {
    //         res.status(200).json({
    //             ok: true,
    //             hospitales
    //         });
    //     });
    // } else if (tabla.toUpperCase() === '') {
    //     buscarMedicos(busqueda, regBusqueda).then(medicos => {
    //         res.status(200).json({
    //             ok: true,
    //             medicos
    //         });
    //     });
    // } else if (tabla.toUpperCase() === 'USUARIO') {
    //     buscarUsuarios(busqueda, regBusqueda).then(usuarios => {
    //         res.status(200).json({
    //             ok: true,
    //             usuarios
    //         });
    //     });
    // } else {
    //     res.status(404).json({
    //         ok: false,
    //         message: `No se encuentra un nombre de collection ${tabla}`
    //     });
    // }
});

//============================================================
// Busqueda general y todas sus funciones
//============================================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    // esto equivale a like '%%' en sql, esto es una expresion regular en donde la i es de insensible
    var regBusqueda = new RegExp(busqueda, 'i'); //esto es puro javascript

    Promise.all([
        buscarHospitales(busqueda, regBusqueda),
        buscarMedicos(busqueda, regBusqueda),
        buscarUsuarios(busqueda, regBusqueda)
    ]).then(respuesta => {
        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });
    })

});

function buscarHospitales(busqueda, regBusqueda) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regBusqueda })
            .populate('usuario', 'nombre email, role')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regBusqueda) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regBusqueda })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarUsuarios(busqueda, regBusqueda) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regBusqueda }, { 'email': regBusqueda }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}


module.exports = app;