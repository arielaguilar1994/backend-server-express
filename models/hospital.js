var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }, //esto es para indicar que es una relacion con otro solo el id
}, { collection: 'hospitales' }); //esto es para que mongose cree la coleccion como le digo si es que no la cree yo en BD

module.exports = mongoose.model('Hospital', hospitalSchema);