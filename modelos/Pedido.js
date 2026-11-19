//Conecta con mongoose//
const mongoose = require('mongoose');
//Establece los campos y reglas de validación que debe cumplir cada documento de pedido//
const pedidoSchema = new mongoose.Schema({
    //Guarda la referencia al usuario que realizó el pedido, utilizando el ObjectId del modelo Usuario//
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    //Guarda el nombre del cliente que realizó el pedido//
    nombreCliente: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80
    },
    //Guarda el teléfono del cliente que realizó el pedido//
    telefono: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    //Guarda el producto que se está pidiendo//
    producto: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 120
    },
    //Guarda el estado del pedido//
    estado: {
        type: String,
        enum: ['pendiente', 'confirmado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    //Guarda la fecha en que se realizó el pedido//
    fecha: {
        type: Date,
        default: Date.now
    }
});
//Crea y exporta el modelo de pedido para que pueda ser utilizado en otras partes de la aplicación//
module.exports = mongoose.model('Pedido', pedidoSchema, 'Pedidos');
