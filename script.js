// =========================================================
// script.js - Milachet
// =========================================================

// Número de WhatsApp al que se enviarán los pedidos.
// IMPORTANTE: reemplaza este número por el número real del negocio,
// con código de país y sin espacios ni símbolos (ej: 573001234567).
const NUMERO_WHATSAPP = "573222392766";

/**
 * Se ejecuta al hacer clic sobre una imagen dentro de la mini-galería
 * de estilos de un producto.
 * - Marca visualmente la imagen seleccionada dentro de su galería.
 * - Autocompleta el campo "Producto de interés" del formulario de contacto
 *   con el nombre del estilo elegido.
 */
function seleccionarFoto(imagenClickeada, nombreEstilo) {
    // Buscamos la mini-galería a la que pertenece la imagen clickeada
    const galeria = imagenClickeada.closest(".mini-galeria");

    if (galeria) {
        // Quitamos la clase "seleccionada" de todas las figuras de esa galería
        const figuras = galeria.querySelectorAll(".item-galeria");
        figuras.forEach((figura) => figura.classList.remove("foto-seleccionada"));

        // Le agregamos la clase "seleccionada" a la figura clickeada
        const figuraActual = imagenClickeada.closest(".item-galeria");
        if (figuraActual) {
            figuraActual.classList.add("foto-seleccionada");
        }
    }

    // Autocompletamos el campo de "Producto de interés"
    const inputProducto = document.getElementById("producto");
    if (inputProducto) {
        inputProducto.value = nombreEstilo;
        inputProducto.focus();
    }
}

/**
 * Se ejecuta al hacer clic en el botón "Enviar a mi WhatsApp".
 * - Valida que los campos requeridos estén completos.
 * - Arma un mensaje con los datos del formulario.
 * - Abre WhatsApp (app o web) con el mensaje precargado.
 */
function enviarWhatsApp() {
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const producto = document.getElementById("producto").value.trim();

    // Validación básica de los campos obligatorios
    if (!nombre || !apellido) {
        alert("Por favor completa tu nombre y apellido antes de enviar el pedido.");
        return;
    }

    // Construimos el mensaje
    let mensaje = `¡Hola Milachet! 👋\n`;
    mensaje += `Mi nombre es ${nombre} ${apellido}.\n`;

    if (producto) {
        mensaje += `Estoy interesado(a) en: ${producto}.\n`;
    } else {
        mensaje += `Quisiera más información sobre sus productos.\n`;
    }

    mensaje += `\nEnviado desde la página web de Milachet.`;

    // Codificamos el mensaje para que sea válido en una URL
    const mensajeCodificado = encodeURIComponent(mensaje);

    // Armamos el enlace de WhatsApp y lo abrimos en una nueva pestaña
    const enlaceWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;
    window.open(enlaceWhatsApp, "_blank");
}

// =========================================================
// Extras de experiencia de usuario (opcionales pero útiles)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    // Scroll suave al hacer clic en los enlaces del menú (#sobre, #productos, #contacto)
    const enlacesMenu = document.querySelectorAll('.menu-link, a[href^="#"]');
    enlacesMenu.forEach((enlace) => {
        enlace.addEventListener("click", (evento) => {
            const destino = enlace.getAttribute("href");
            if (destino && destino.startsWith("#") && destino.length > 1) {
                const seccion = document.querySelector(destino);
                if (seccion) {
                    evento.preventDefault();
                    seccion.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        });
    });

    // Al abrir un <details> de "Ver Estilos", cerramos los demás
    // para que solo se muestre una galería de estilos a la vez.
    const detalles = document.querySelectorAll(".detalles-producto");
    detalles.forEach((detalle) => {
        detalle.addEventListener("toggle", () => {
            if (detalle.open) {
                detalles.forEach((otro) => {
                    if (otro !== detalle) otro.open = false;
                });
            }
        });
    });
});