
require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./modelos/Producto');

async function cargar() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const productos = [
            { nombre: 'Bufanda', precio: 45000 },
            { nombre: 'Bolso', precio: 65000 },
            { nombre: 'Llaveros', precio: 17000 },
            { nombre: 'Separadores', precio: 15000 },
            { nombre: 'Aretes', precio: 15000 }
        ];

        for (const producto of productos) {
            await Producto.updateOne(
                { nombre: producto.nombre },
                { $set: { precio: producto.precio } },
                { upsert: true }
            );
        }

        console.log('Catálogo actualizado correctamente');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

cargar();
