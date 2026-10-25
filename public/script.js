const NUMERO_WHATSAPP = "573222392766";

function seleccionarFoto(imagenClickeada, nombreEstilo) {

    const galeria = imagenClickeada.closest(".mini-galeria");

    if (galeria) {

        const figuras = galeria.querySelectorAll(".item-galeria");
        figuras.forEach((figura) => figura.classList.remove("foto-seleccionada"));


        const figuraActual = imagenClickeada.closest(".item-galeria");
        if (figuraActual) {
            figuraActual.classList.add("foto-seleccionada");
        }
    }


    const inputProducto = document.getElementById("producto");
    if (inputProducto) {
        inputProducto.value = nombreEstilo;
        inputProducto.focus();
    }
}

async function enviarWhatsApp() {
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const producto = document.getElementById("producto").value.trim();

    if (!nombre || !apellido) {
        alert("Por favor completa tu nombre y apellido antes de enviar el pedido.");
        return;
    }

    // Se abre la ventana dentro del clic para que el navegador no la bloquee
    const ventana = window.open("", "_blank");

    // Guardamos el contacto en el backend (MongoDB)
    try {
        await fetch("/api/contactos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, apellido, producto })
        });
    } catch (error) {
        console.log("No se pudo guardar el contacto", error); // aun así sigue a WhatsApp
    }

    let mensaje = `¡Hola Milachet! 👋\n`;
    mensaje += `Mi nombre es ${nombre} ${apellido}.\n`;

    if (producto) {
        mensaje += `Estoy interesado(a) en: ${producto}.\n`;
    } else {
        mensaje += `Quisiera más información sobre sus productos.\n`;
    }

    mensaje += `\nEnviado desde la página web de Milachet.`;


    const mensajeCodificado = encodeURIComponent(mensaje);

    const enlaceWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;

    if (ventana) {
        ventana.location.href = enlaceWhatsApp;
    } else {
        window.location.href = enlaceWhatsApp;
    }
}


document.addEventListener("DOMContentLoaded", () => {

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