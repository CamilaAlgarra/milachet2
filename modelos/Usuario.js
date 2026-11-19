const mongoose = require('mongoose');
//Define la estructura y reglas de validación que debe tener cada documento de usuario//
const usuarioSchema = new mongoose.Schema({
    nombre:   { type: String, required: true, trim: true }, //Obligatorio//
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },//Obligatorio y único//
    password: { type: String, required: true }, //Obligatorio//
    rol:      { type: String, enum: ['cliente', 'admin'], default: 'cliente' }, //Obligatorio y con valores predefinidos//
    telefono: { type: String, trim: true, default: '' }, //Opcional//
    creado:   { type: Date, default: Date.now } //Obligatorio//
});
//Crea y exporta el modelo de usuario para que pueda ser utilizado en otras partes de la aplicación//
module.exports = mongoose.model('Usuario', usuarioSchema, 'Usuarios');