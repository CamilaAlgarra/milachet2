const mongoose = require('mongoose');

const contactoSchema = new mongoose.Schema({
    nombre:   { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    producto: { type: String, trim: true, default: '' },
    fecha:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contacto', contactoSchema, 'Contactos');