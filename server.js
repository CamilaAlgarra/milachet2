require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Producto = require('./modelos/Producto');
const Contacto = require('./modelos/Contacto');
const Usuario = require('./modelos/Usuario');
const Pedido = require('./modelos/Pedido');

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error.message));

app.use(express.json());
app.use(express.static('public'));

// ---------- UTILIDADES ----------
const REGEX_TELEFONO = /^[0-9+\s()-]{7,20}$/;
const limpiar = (valor, max) => String(valor || '').trim().slice(0, max);

// ---------- CONTROL DE ACCESO ----------

function verificarToken(req, res, next) {
    const cabecera = req.headers.authorization || '';
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Debes iniciar sesión' });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Sesión inválida o expirada' });
    }
}

function soloAdmin(req, res, next) {
    verificarToken(req, res, () => {
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ error: 'Solo la creadora puede hacer esto' });
        }
        next();
    });
}

// ---------- PRODUCTOS ----------

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

app.post('/api/productos', soloAdmin, async (req, res) => {
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

app.put('/api/productos/:id', soloAdmin, async (req, res) => {
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

app.delete('/api/productos/:id', soloAdmin, async (req, res) => {
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

// ---------- CONTACTOS (se conservan, el formulario ya no los usa) ----------

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

app.get('/api/contactos', soloAdmin, async (req, res) => {
    try {
        const contactos = await Contacto.find().sort({ fecha: -1 });
        res.json(contactos);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ---------- REGISTRO Y LOGIN ----------

app.post('/api/auth/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password || String(password).length < 6) {
            return res.status(400).json({
                error: 'Nombre, correo y contraseña (mínimo 6 caracteres) son obligatorios'
            });
        }

        const correo = String(email).toLowerCase().trim();
        const existe = await Usuario.findOne({ email: correo });
        if (existe) {
            return res.status(409).json({ error: 'Ese correo ya está registrado' });
        }

        const passwordCifrada = await bcrypt.hash(String(password), 10);
        await Usuario.create({ nombre, email: correo, password: passwordCifrada });

        res.status(201).json({ mensaje: 'Cuenta creada' });
    } catch (error) {
        console.error('Error en registro:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Datos inválidos' });
        }
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({
            email: String(email || '').toLowerCase().trim()
        });

        const correcto = usuario && await bcrypt.compare(String(password || ''), usuario.password);
        if (!correcto) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ---------- PERFIL ----------

// Cada persona ve y edita SOLO su perfil (el id sale del token)
app.get('/api/perfil', verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.put('/api/perfil', verificarToken, async (req, res) => {
    try {
        const cambios = {
            nombre:   limpiar(req.body.nombre, 80),
            telefono: limpiar(req.body.telefono, 20)
        };

        if (!cambios.nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        if (cambios.telefono && !REGEX_TELEFONO.test(cambios.telefono)) {
            return res.status(400).json({ error: 'Escribe un teléfono válido' });
        }

        const usuario = await Usuario.findByIdAndUpdate(req.usuario.id, cambios, {
            new: true,
            runValidators: true
        }).select('-password');

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ---------- PEDIDOS ----------

// Un cliente con sesión registra un pedido
app.post('/api/pedidos', verificarToken, async (req, res) => {
    try {
        const nombre = limpiar(req.body.nombre, 80);
        const telefono = limpiar(req.body.telefono, 20);
        const producto = limpiar(req.body.producto, 120);

        if (!nombre || !producto) {
            return res.status(400).json({ error: 'El nombre y el producto son obligatorios' });
        }
        if (!REGEX_TELEFONO.test(telefono)) {
            return res.status(400).json({ error: 'Escribe un teléfono válido' });
        }

        const pedido = await Pedido.create({
            usuario: req.usuario.id,
            nombreCliente: nombre,
            telefono,
            producto
        });

        // Si el perfil no tenía teléfono, se guarda para la próxima vez
        await Usuario.updateOne(
            { _id: req.usuario.id, $or: [{ telefono: '' }, { telefono: { $exists: false } }] },
            { telefono }
        );

        res.status(201).json(pedido);
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// El cliente ve SOLO sus pedidos
app.get('/api/pedidos/mios', verificarToken, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuario: req.usuario.id }).sort({ fecha: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// La creadora ve TODOS los pedidos
app.get('/api/pedidos', soloAdmin, async (req, res) => {
    try {
        const pedidos = await Pedido.find()
            .populate('usuario', 'nombre email')
            .sort({ fecha: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// La creadora cambia el estado de un pedido
app.patch('/api/pedidos/:id', soloAdmin, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Id inválido' });
        }

        const estados = ['pendiente', 'confirmado', 'entregado', 'cancelado'];
        if (!estados.includes(req.body.estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { estado: req.body.estado },
            { new: true }
        );

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});