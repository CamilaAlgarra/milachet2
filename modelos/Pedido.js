const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    usuario:       { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    nombreCliente: { type: String, required: true, trim: true },
    telefono:      { type: String, required: true, trim: true },
    producto:      { type: String, required: true, trim: true },
    estado:        { type: String, enum: ['pendiente', 'confirmado', 'entregado', 'cancelado'], default: 'pendiente' },
    fecha:         { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', pedidoSchema, 'Pedidos');