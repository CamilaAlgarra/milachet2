//Se conecta con mongoose//
const mongoose = require('mongoose');
//Define la estructura y reglas de validación que debe tener cada documento de contacto//
const contactoSchema = new mongoose.Schema({
    nombre:   { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    producto: { type: String, trim: true, default: '' }, //Opcional//
    fecha:    { type: Date, default: Date.now }
});
//Crea y exporta el modelo de contacto para que pueda ser utilizado en otras partes de la aplicación//
module.exports = mongoose.model('Contacto', contactoSchema, 'Contactos');