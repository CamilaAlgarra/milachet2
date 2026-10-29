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

    // El botón "Pedir" de este producto lleva el estilo elegido
    const contenedor = imagenClickeada.closest(".contenido-desplegable");
    const botonPedir = contenedor ? contenedor.querySelector(".btn-pedir") : null;
    if (botonPedir) {
        botonPedir.href = "contacto.html?producto=" + encodeURIComponent(nombreEstilo);
    }

    const inputProducto = document.getElementById("producto");
    if (inputProducto) {
        inputProducto.value = nombreEstilo;
        inputProducto.focus();
    }
}

// Botón "Pedir" de contacto.html: registra el pedido y abre WhatsApp
async function pedir() {
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const producto = document.getElementById("producto").value.trim();

    if (!nombre || !telefono || !producto) {
        alert("Escribe tu nombre, tu teléfono y el producto que quieres.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Para hacer un pedido primero inicia sesión o crea tu cuenta.");
        const volver = location.pathname.split("/").pop() + location.search;
        window.location.href = "login.html?volver=" + encodeURIComponent(volver);
        return;
    }

    // Se abre la ventana dentro del clic para que el navegador no la bloquee
    const ventana = window.open("", "_blank");

    try {
        const respuesta = await fetch("/api/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ nombre, telefono, producto })
        });
        const datos = await respuesta.json().catch(() => ({}));

        if (respuesta.status === 401) {
            if (ventana) ventana.close();
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            alert("Tu sesión venció. Inicia sesión de nuevo.");
            const volver = location.pathname.split("/").pop() + location.search;
            window.location.href = "login.html?volver=" + encodeURIComponent(volver);
            return;
        }

        if (!respuesta.ok) {
            if (ventana) ventana.close();
            alert(datos.error || "No se pudo registrar el pedido");
            return;
        }
    } catch (error) {
        if (ventana) ventana.close();
        alert("No se pudo conectar con el servidor. Intenta de nuevo.");
        return;
    }

    let mensaje = `¡Hola Milachet! 👋\n`;
    mensaje += `Mi nombre es ${nombre}.\n`;
    mensaje += `Quiero pedir: ${producto}.\n`;
    mensaje += `Mi teléfono de contacto: ${telefono}.\n`;
    mensaje += `\nPedido hecho desde la página web de Milachet.`;

    const enlaceWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    if (ventana) {
        ventana.location.href = enlaceWhatsApp;
    } else {
        window.location.href = enlaceWhatsApp;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // En contacto.html: el producto llega escrito desde "Pedir"
    const productoDeLaUrl = new URLSearchParams(window.location.search).get("producto");
    const inputProducto = document.getElementById("producto");
    if (productoDeLaUrl && inputProducto) {
        inputProducto.value = productoDeLaUrl;
    }

    // En contacto.html: con sesión iniciada, nombre y teléfono salen del perfil
    const inputNombre = document.getElementById("nombre");
    const inputTelefono = document.getElementById("telefono");
    const token = localStorage.getItem("token");
    if (token && inputNombre && inputTelefono) {
        fetch("/api/perfil", { headers: { "Authorization": "Bearer " + token } })
            .then((respuesta) => (respuesta.ok ? respuesta.json() : null))
            .then((perfil) => {
                if (!perfil) return;
                if (!inputNombre.value) inputNombre.value = perfil.nombre || "";
                if (!inputTelefono.value) inputTelefono.value = perfil.telefono || "";
            })
            .catch(() => {});
    }

    // En productos.html: por defecto "Pedir" lleva el nombre del producto (si no eligen estilo)
    document.querySelectorAll(".producto").forEach((tarjeta) => {
        const titulo = tarjeta.querySelector("h3");
        const botonPedir = tarjeta.querySelector(".btn-pedir");
        if (titulo && botonPedir) {
            botonPedir.href = "contacto.html?producto=" + encodeURIComponent(titulo.textContent.trim());
        }
    });

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