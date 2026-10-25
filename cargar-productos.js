require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./modelos/Producto');

async function cargar() {
    await mongoose.connect(process.env.MONGO_URI);
    await Producto.deleteMany({});
    await Producto.insertMany([
        { nombre: 'Bufanda', precio: 45000 },
        { nombre: 'Bolso', precio: 65000 },
        { nombre: 'Separadores', precio: 15000 },
        { nombre: 'Aretes', precio: 15000 }
    ]);
    console.log('Productos cargados en Atlas');
    await mongoose.disconnect();
}

cargar().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
});