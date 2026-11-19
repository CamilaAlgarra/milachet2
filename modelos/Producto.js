const mongoose = require('mongoose');
//Define la estructura y reglas de validación que debe tener cada documento de producto//
const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true }, //Obligatorio//
    precio: { type: Number, required: true, min: 0 } //Obligatorio//
});
//Crea y exporta el modelo de producto para que pueda ser utilizado en otras partes de la aplicación//
module.exports = mongoose.model('Producto', productoSchema, 'Productos');