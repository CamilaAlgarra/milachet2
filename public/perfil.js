const ESTADOS = ["pendiente", "confirmado", "entregado", "cancelado"];
const token = localStorage.getItem("token");

function salirALogin() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html?volver=perfil.html";
}

async function api(ruta, opciones = {}) {
    const respuesta = await fetch(ruta, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    });
    if (respuesta.status === 401) {
        salirALogin();
        throw new Error("sesion");
    }
    const cuerpo = await respuesta.json().catch(() => ({}));
    return { ok: respuesta.ok, cuerpo };
}

function mostrarMensaje(texto, tipo) {
    const caja = document.getElementById("mensaje-perfil");
    caja.textContent = texto;
    caja.style.color = tipo === "error" ? "#b3261e" : "#2e7d32";
    caja.style.fontWeight = "600";
}

function linea(texto) {
    const p = document.createElement("p");
    p.textContent = texto;
    return p;
}

function crearTarjeta(pedido, esAdmin) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "info-card";

    const titulo = document.createElement("h3");
    titulo.textContent = pedido.producto;
    tarjeta.appendChild(titulo);

    if (esAdmin) {
        tarjeta.appendChild(linea("Cliente: " + pedido.nombreCliente));
        tarjeta.appendChild(linea("Teléfono: " + pedido.telefono));
        if (pedido.usuario && pedido.usuario.email) {
            tarjeta.appendChild(linea("Cuenta: " + pedido.usuario.email));
        }
    }

    const fecha = new Date(pedido.fecha).toLocaleDateString("es-CO", {
        day: "numeric", month: "long", year: "numeric"
    });
    tarjeta.appendChild(linea("Fecha: " + fecha));

    if (esAdmin) {
        const etiqueta = document.createElement("label");
        etiqueta.textContent = "Estado: ";

        const select = document.createElement("select");
        ESTADOS.forEach((estado) => {
            const opcion = document.createElement("option");
            opcion.value = estado;
            opcion.textContent = estado;
            if (estado === pedido.estado) opcion.selected = true;
            select.appendChild(opcion);
        });

        select.addEventListener("change", async () => {
            try {
                const { ok, cuerpo } = await api("/api/pedidos/" + pedido._id, {
                    method: "PATCH",
                    body: JSON.stringify({ estado: select.value })
                });
                if (!ok) {
                    alert(cuerpo.error || "No se pudo cambiar el estado");
                    select.value = pedido.estado;
                } else {
                    pedido.estado = select.value;
                }
            } catch (error) {
                select.value = pedido.estado;
            }
        });

        etiqueta.appendChild(select);
        tarjeta.appendChild(etiqueta);
    } else {
        tarjeta.appendChild(linea("Estado: " + pedido.estado));
    }

    return tarjeta;
}

async function cargarPagina() {
    if (!token) {
        salirALogin();
        return;
    }

    try {
        // 1. Perfil
        const { ok, cuerpo: perfil } = await api("/api/perfil");
        if (!ok) {
            mostrarMensaje(perfil.error || "No se pudo cargar tu perfil", "error");
            return;
        }

        const esAdmin = perfil.rol === "admin";
        document.getElementById("perfil-titulo").textContent =
            (esAdmin ? "Panel admin · " : "Hola, ") + perfil.nombre.split(" ")[0];
        document.getElementById("perfil-legend").textContent =
            esAdmin ? "Perfil de la creadora" : "Mis datos";
        document.getElementById("pedidos-titulo").textContent =
            esAdmin ? "Todos los pedidos" : "Mis pedidos";

        document.getElementById("perfil-email").value = perfil.email || "";
        document.getElementById("perfil-nombre").value = perfil.nombre || "";
        document.getElementById("perfil-telefono").value = perfil.telefono || "";

        // 2. Pedidos: la creadora ve todos, el cliente solo los suyos
        const resultado = await api(esAdmin ? "/api/pedidos" : "/api/pedidos/mios");
        const lista = document.getElementById("lista-pedidos");
        lista.replaceChildren();

        if (!resultado.ok || resultado.cuerpo.length === 0) {
            lista.appendChild(linea(esAdmin
                ? "Todavía no hay pedidos."
                : "Todavía no has hecho pedidos."));
            return;
        }

        resultado.cuerpo.forEach((pedido) => {
            lista.appendChild(crearTarjeta(pedido, esAdmin));
        });
    } catch (error) {
        if (error.message !== "sesion") {
            mostrarMensaje("No se pudo conectar con el servidor", "error");
        }
    }
}

document.getElementById("form-perfil").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    try {
        const { ok, cuerpo } = await api("/api/perfil", {
            method: "PUT",
            body: JSON.stringify({
                nombre: document.getElementById("perfil-nombre").value,
                telefono: document.getElementById("perfil-telefono").value
            })
        });

        if (!ok) {
            mostrarMensaje(cuerpo.error || "No se pudieron guardar los cambios", "error");
            return;
        }

        const guardado = JSON.parse(localStorage.getItem("usuario") || "{}");
        guardado.nombre = cuerpo.nombre;
        localStorage.setItem("usuario", JSON.stringify(guardado));

        mostrarMensaje("Cambios guardados", "ok");
    } catch (error) {
        if (error.message !== "sesion") {
            mostrarMensaje("No se pudo conectar con el servidor", "error");
        }
    }
});

cargarPagina();