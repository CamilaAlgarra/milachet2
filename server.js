
require('dotenv').config();
const rateLimit = require('express-rate-limit');
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

app.use(express.json({ limit: '10kb' }));

const limiteAcceso = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: 'Demasiados intentos. Intenta nuevamente en 15 minutos.'
    }
});

const REGEX_TELEFONO = /^[0-9+\s()-]{7,20}$/;
const limpiar = (valor, max) => String(valor || '').trim().slice(0, max);



function verificarToken(req, res, next) {
    const cabecera = req.headers.authorization || '';

    if (!cabecera.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Debes iniciar sesión'
        });
    }

    const token = cabecera.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            error: 'Token no proporcionado'
        });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Sesión inválida o expirada'
        });
    }
}

function soloAdmin(req, res, next) {
    verificarToken(req, res, async () => {
        try {
            const usuario = await Usuario.findById(req.usuario.id)
                .select('rol');

            if (!usuario) {
                return res.status(401).json({
                    error: 'Usuario no encontrado'
                });
            }

            if (usuario.rol !== 'admin') {
                return res.status(403).json({
                    error: 'Solo la administradora puede hacer esto'
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando administrador:', error);

            return res.status(500).json({
                error: 'Error al verificar permisos'
            });
        }
    });
}

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



app.post('/api/contactos', async (req, res) => {
    try {
        const nombre = limpiar(req.body.nombre, 80);
        const apellido = limpiar(req.body.apellido, 80);
        const producto = limpiar(req.body.producto, 120);

        if (nombre.length < 2 || apellido.length < 2) {
            return res.status(400).json({
                error: 'Escribe un nombre y apellido válidos'
            });
        }

        if (req.body.producto && !producto) {
            return res.status(400).json({
                error: 'El producto no es válido'
            });
        }

        const contacto = await Contacto.create({
            nombre,
            apellido,
            producto
        });

        res.status(201).json({
            mensaje: 'Contacto guardado correctamente',
            contacto
        });

    } catch (error) {
        console.error('Error al guardar contacto:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Revisa los datos ingresados'
            });
        }

        res.status(500).json({
            error: 'Error del servidor'
        });
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




app.post('/api/auth/registro', limiteAcceso, async (req, res) => {
    try {
        const nombre = limpiar(req.body.nombre, 80);
        const correo = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

        if (nombre.length < 2) {
            return res.status(400).json({
                error: 'El nombre debe tener al menos 2 caracteres'
            });
        }

        if (!correoValido || correo.length > 254) {
            return res.status(400).json({
                error: 'Escribe un correo electrónico válido'
            });
        }

        if (password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({
                error: 'La contraseña debe tener mínimo 6 caracteres y no superar el límite permitido'
            });
        }

        const existe = await Usuario.findOne({ email: correo });

        if (existe) {
            return res.status(409).json({
                error: 'Ese correo ya está registrado'
            });
        }

        const passwordCifrada = await bcrypt.hash(password, 10);

        await Usuario.create({
            nombre,
            email: correo,
            password: passwordCifrada
        });

        res.status(201).json({
            mensaje: 'Cuenta creada correctamente'
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Ese correo ya está registrado'
            });
        }

        console.error('Error en registro:', error);

        res.status(500).json({
            error: 'Error del servidor'
        });
    }
});


app.post('/api/auth/login', limiteAcceso, async (req, res) => {
    try {
        const correo = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (!correo || !password || correo.length > 254 ||
            Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({
                error: 'Ingresa un correo y una contraseña válidos'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('Falta configurar JWT_SECRET');
            return res.status(500).json({
                error: 'Error de configuración del servidor'
            });
        }

        const usuario = await Usuario.findOne({ email: correo });

        const correcto = usuario &&
            await bcrypt.compare(password, usuario.password);

        if (!correcto) {
            return res.status(401).json({
                error: 'Correo o contraseña incorrectos'
            });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en inicio de sesión:', error);

        res.status(500).json({
            error: 'Error del servidor'
        });
    }
});

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
            nombre: limpiar(req.body.nombre, 80),
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

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});



app.post('/api/pedidos', verificarToken, async (req, res) => {
    try {
        const nombre = limpiar(req.body.nombre, 80);
        const telefono = limpiar(req.body.telefono, 20);
        const producto = limpiar(req.body.producto, 120);

        if (!nombre || !producto) {
            return res.status(400).json({
                error: 'El nombre y el producto son obligatorios'
            });
        }

        if (nombre.length < 2 || producto.length < 2) {
            return res.status(400).json({
                error: 'Los datos ingresados son demasiado cortos'
            });
        }

        if (!REGEX_TELEFONO.test(telefono)) {
            return res.status(400).json({
                error: 'Escribe un teléfono válido'
            });
        }

        const pedido = await Pedido.create({
            usuario: req.usuario.id,
            nombreCliente: nombre,
            telefono,
            producto
        });

        await Usuario.updateOne(
            {
                _id: req.usuario.id,
                $or: [
                    { telefono: '' },
                    { telefono: { $exists: false } }
                ]
            },
            { $set: { telefono } }
        );

        res.status(201).json({
            mensaje: 'Pedido registrado correctamente',
            pedido
        });

    } catch (error) {
        console.error('Error al crear pedido:', error);

        res.status(500).json({
            error: 'No se pudo registrar el pedido'
        });
    }
});


app.get('/api/pedidos/mios', verificarToken, async (req, res) => {
    try {
        const pedidos = await Pedido.find({ usuario: req.usuario.id }).sort({ fecha: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

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
            { new: true, runValidators: true }
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
