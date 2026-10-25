require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Producto = require('./modelos/Producto');
const Contacto = require('./modelos/Contacto');

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error.message));

app.use(express.json());
app.use(express.static('public'));

// GET TODOS LOS PRODUCTOS//
app.get('/api/productos', async (req, res) => {
    try {
        const { nombre } = req.query;
        const filtro = {};

        if (nombre) {
            const seguro = String(nombre).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filtro.nombre = { $regex: seguro, $options: 'i' };
        }

        const productos = await Producto.find(filtro);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// GET SOLO UN PRODUCTO POR ID//
app.get('/api/productos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Id inválido' });
        }

        const producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// POST //
app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, precio } = req.body;
        const nuevo = await Producto.create({ nombre, precio });
        res.status(201).json(nuevo);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Se requiere nombre y precio (número)' });
        }
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// PUT //
app.put('/api/productos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Id inválido' });
        }

        const cambios = {};
        if (req.body.nombre !== undefined) cambios.nombre = req.body.nombre;
        if (req.body.precio !== undefined) cambios.precio = req.body.precio;

        const producto = await Producto.findByIdAndUpdate(req.params.id, cambios, {
            new: true,
            runValidators: true
        });

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ error: 'Datos inválidos' });
        }
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// DELETE//
app.delete('/api/productos/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Id inválido' });
        }

        const eliminado = await Producto.findByIdAndDelete(req.params.id);

        if (!eliminado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto eliminado', producto: eliminado });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// POST GUARDAR EL CONTACTO//
app.post('/api/contactos', async (req, res) => {
    try {
        const { nombre, apellido, producto } = req.body;
        await Contacto.create({ nombre, apellido, producto });
        res.status(201).json({ mensaje: 'Contacto guardado' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
        }
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});