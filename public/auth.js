// ---------- Sesión guardada en el navegador ----------
function obtenerUsuario() {
    try {
        return JSON.parse(localStorage.getItem("usuario"));
    } catch (error) {
        return null;
    }
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
}

// Si el login trae ?volver=contacto.html?producto=..., se regresa ahí (solo páginas del sitio)
function destinoSeguro() {
    const volver = new URLSearchParams(location.search).get("volver");
    return volver && /^[\w-]+\.html(\?\S*)?$/.test(volver) ? volver : "index.html";
}

// ---------- Botones del menú ----------
function pintarMenuSesion() {
    const menu = document.querySelector(".menu");
    if (!menu) return;

    const usuario = obtenerUsuario();
    const extra = location.pathname.endsWith("login.html") ? location.search : "";

    function agregar(texto, href, alClic) {
        const item = document.createElement("li");
        const boton = document.createElement("a");
        boton.href = href;
        boton.className = "btn-hero";
        boton.textContent = texto;
        if (alClic) {
            boton.addEventListener("click", (evento) => {
                evento.preventDefault();
                alClic();
            });
        }
        item.appendChild(boton);
        menu.appendChild(item);
    }

    if (usuario) {
        agregar(usuario.rol === "admin" ? "Panel admin" : "Mi perfil", "perfil.html");
        agregar("Cerrar sesión", "#", cerrarSesion);
    } else {
        agregar("Iniciar sesión", "login.html" + extra);
        agregar("Crear cuenta", "login.html" + extra + "#registro");
    }
}

// ---------- Formularios de login.html ----------
function mostrarMensaje(texto, tipo) {
    const caja = document.getElementById("mensaje-auth");
    if (!caja) return;
    caja.textContent = texto;
    caja.style.color = tipo === "error" ? "#b3261e" : "#2e7d32";
    caja.style.fontWeight = "600";
}

async function enviarAuth(ruta, datos) {
    const respuesta = await fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });
    const cuerpo = await respuesta.json().catch(() => ({}));
    return { ok: respuesta.ok, cuerpo };
}

function iniciarFormularios() {
    const formLogin = document.getElementById("form-login");
    const formRegistro = document.getElementById("form-registro");
    if (!formLogin || !formRegistro) return;

    function mostrarPanel(cual) {
        formLogin.hidden = cual !== "login";
        formRegistro.hidden = cual !== "registro";
        mostrarMensaje("", "");
    }

    function segunHash() {
        mostrarPanel(location.hash === "#registro" ? "registro" : "login");
    }

    window.addEventListener("hashchange", segunHash);
    segunHash();

    // Iniciar sesión
    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        try {
            const { ok, cuerpo } = await enviarAuth("/api/auth/login", { email, password });

            if (!ok) {
                mostrarMensaje(cuerpo.error || "No se pudo iniciar sesión", "error");
                return;
            }

            localStorage.setItem("token", cuerpo.token);
            localStorage.setItem("usuario", JSON.stringify(cuerpo.usuario));
            window.location.href = destinoSeguro();
        } catch (error) {
            mostrarMensaje("No se pudo conectar con el servidor", "error");
        }
    });

    // Crear cuenta
    formRegistro.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const nombre = document.getElementById("registro-nombre").value.trim();
        const email = document.getElementById("registro-email").value.trim();
        const password = document.getElementById("registro-password").value;

        try {
            const { ok, cuerpo } = await enviarAuth("/api/auth/registro", { nombre, email, password });

            if (!ok) {
                mostrarMensaje(cuerpo.error || "No se pudo crear la cuenta", "error");
                return;
            }

            formRegistro.reset();
            document.getElementById("login-email").value = email;
            history.replaceState(null, "", location.pathname + location.search);
            mostrarPanel("login");
            mostrarMensaje("Cuenta creada. Ahora inicia sesión.", "ok");
        } catch (error) {
            mostrarMensaje("No se pudo conectar con el servidor", "error");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    pintarMenuSesion();
    iniciarFormularios();
});