async function cargarPrecios() {
    try {
        const respuesta = await fetch("/api/productos");
        if (!respuesta.ok) return;
        const productos = await respuesta.json();

        document.querySelectorAll(".producto").forEach((tarjeta) => {
            const titulo = tarjeta.querySelector("h3");
            const precio = tarjeta.querySelector(".precio");
            if (!titulo || !precio) return;

            const encontrado = productos.find(
                (p) => p.nombre.toLowerCase() === titulo.textContent.trim().toLowerCase()
            );

            if (encontrado) {
                precio.textContent = "$" + String(encontrado.precio).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            }
        });
    } catch (error) {
        console.log("No se pudieron cargar los precios", error);
    }
}

document.addEventListener("DOMContentLoaded", cargarPrecios);
