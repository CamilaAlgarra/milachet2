const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const productos = [
    { id: 1, nombre: 'Bufanda', precio: 45000 },
    { id: 2, nombre: 'Bolso', precio: 65000 },
    { id: 3, nombre: 'Separadores', precio: 15000 },
    { id: 4, nombre: 'Aretes', precio: 15000 },
];


app.get('/api/productos', (req, res) => {
    const { nombre } = req.query;

    if (nombre) {
        const filtrados = productos.filter((p) =>
            p.nombre.toLowerCase().includes(nombre.toLowerCase())
        );
        return res.json(filtrados);
    }

    res.json(productos);
});


app.get('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const producto = productos.find((p) => p.id === id);

    if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);
});

app.post('/api/productos', (req, res) => {
    const { nombre, precio } = req.body;

    // Validación: nombre obligatorio y precio numérico
    if (!nombre || typeof precio !== 'number') {
        return res.status(400).json({ error: 'Se requiere nombre y precio (número)' });
    }

    const nuevo = {
        id: productos.length ? productos[productos.length - 1].id + 1 : 1,
        nombre,
        precio,
    };

    productos.push(nuevo);
    res.status(201).json(nuevo);
});

app.put('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const producto = productos.find((p) => p.id === id);

    if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { nombre, precio } = req.body;

    if (precio !== undefined && typeof precio !== 'number') {
        return res.status(400).json({ error: 'El precio debe ser un número' });
    }

    if (nombre !== undefined) producto.nombre = nombre;
    if (precio !== undefined) producto.precio = precio;

    res.json(producto);
});


app.delete('/api/productos/:id', (req, res) => {
    const id = Number(req.params.id);
    const indice = productos.findIndex((p) => p.id === id);

    if (indice === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const eliminado = productos.splice(indice, 1)[0];
    res.json({ mensaje: 'Producto eliminado', producto: eliminado });
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});