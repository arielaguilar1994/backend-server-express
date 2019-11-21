var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs'); //fileSystem

var app = express();

var Usuario = require('../models/usuario');
var Medicos = require('../models/medico');
var Hospitales = require('../models/hospital');

app.use(fileUpload());


app.get('/', (req, res, next) => {
    res.status(404).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

app.put('/:tipo/:id', function(req, res) {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion
    var tipoValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tipoValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: `Los tipos permitidos son ${ tipoValidos.join(', ') }` }
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //solo estas extensiones se aceptan
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) { //esta funcion si no encuentra nada da un valor menor si encuentra es positivo
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    //nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    //Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'No se encontro el usuario',
                    errors: { message: `No se encuentra el usuario con el id: ${id}` }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuarioDB.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuarioDB.img = nombreArchivo;

            usuarioDB.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al actualziar el usario',
                        errors: err
                    });
                }
                usuarioActualizado.password = ':)'
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medicos.findById(id, (err, medicoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!medicoDB) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'No se encontro el medico',
                    errors: { message: `No se encuentra el medico con el id: ${id}` }
                });
            }

            var pathViejo = './uploads/medicos/' + medicoDB.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medicoDB.img = nombreArchivo;

            medicoDB.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al actualizar el medico',
                        errors: err
                    });
                }
                medicoActualizado.password = ':)'
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del Medico Actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    // if (tipo === 'medicos') {
    //     Medicos.findById(id, (err, medicoDB) => {
    //         if (err) {
    //             return res.status(500).json({
    //                 ok: false,
    //                 mensaje: 'Error al buscar el medico',
    //                 errors: err
    //             });
    //         }

    //         if (!medicoDB) {
    //             return res.status(400).json({
    //                 ok: true,
    //                 mensaje: 'No se encontro el medico',
    //                 errors: { message: `No se encuentra el medico con el id: ${id}` }
    //             });
    //         }

    //         var pathViejo = './uploads/medicos/' + medicoDB.img;

    //         if (fs.existsSync(pathViejo)) {
    //             fs.unlinkSync(pathViejo);
    //         }

    //         medicoDB.img = nombreArchivo;

    //         medicoDB.save((err, medicoActualizado) => {
    //             if (err) {
    //                 return res.status(500).json({
    //                     ok: false,
    //                     mensaje: 'Error al actualzar el medico',
    //                     errors: err
    //                 });
    //             }

    //             return res.status(200).json({
    //                 ok: true,
    //                 mensaje: 'Medico actualizado',
    //                 medico: medicoActualizado
    //             });
    //         });
    //     });
    // }
    if (tipo === 'hospitales') {
        Hospitales.findById(id, (err, hospitalDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar el hospital',
                    errors: err
                });
            }

            if (!hospitalDB) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'No se encontro el hospital',
                    errors: { message: `No se encuentra el hospital con el id: ${id}` }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospitalDB.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospitalDB.img = nombreArchivo;

            hospitalDB.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualzar el hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Hospital actualizado',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}


module.exports = app;