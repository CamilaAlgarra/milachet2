//Carga las variables de entorno desde el archivo .env//
require('dotenv').config();
const mongoose = require('mongoose');
//Importa el modelo de producto para poder interactuar con la colección de productos en la base de datos//
const Producto = require('./modelos/Producto');
//Declara la función asincrónica que se encargará de cargar los productos en la base de datos//
async function cargar() {
    try {
        //Conecta con la base de datos utilizando la URI almacenada en las variables de entorno//
        await mongoose.connect(process.env.MONGO_URI);
//Define un arreglo de objetos que representan los productos a cargar en la base de datos, cada uno con un nombre y un precio// 
        const productos = [
            { nombre: 'Bufanda', precio: 45000 },
            { nombre: 'Bolso', precio: 65000 },
            { nombre: 'Llaveros', precio: 17000 },
            { nombre: 'Separadores', precio: 15000 },
            { nombre: 'Aretes', precio: 15000 }
        ];
//Recorre uno a uno el arreglo de productos y actualiza o inserta cada producto en la base de datos utilizando el método updateOne de Mongoose, que busca un producto por su nombre y actualiza su precio, o lo inserta si no existe (upsert: true)//
        for (const producto of productos) {
            //Actualiza o inserta el producto en la base de datos//
            await Producto.updateOne(
                { nombre: producto.nombre },
                { $set: { precio: producto.precio } },
                { upsert: true }
            );
        }
//Muesta un mensaje en la consola indicando que el catálogo de productos se ha actualizado correctamente//
        console.log('Catálogo actualizado correctamente');
        //Captura y muestra cualquier error que ocurra durante la ejecución de la función, incluyendo errores de conexión a la base de datos o errores al actualizar los productos//
    } catch (error) {
        console.error('Error:', error.message);
        //Cierra la conexión a la base de datos al finalizar la ejecución de la función, ya sea que haya ocurrido un error o no, para liberar recursos y evitar problemas de conexión//
    } finally {
        await mongoose.disconnect();
    }
}

cargar();
