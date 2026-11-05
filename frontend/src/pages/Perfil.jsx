import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ESTADOS = ["pendiente", "confirmado", "entregado", "cancelado"];

function Perfil() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const esAdmin = perfil?.rol === "admin";

  const salirALogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.dispatchEvent(new Event("sesion-cambio"));
    navigate("/login?volver=" + encodeURIComponent("/perfil"));
  };

  // Llamada al backend con el token; si la sesión venció, va al login
  const api = async (ruta, opciones = {}) => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(ruta, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (respuesta.status === 401) {
      salirALogin();
      throw new Error("sesion");
    }
    const cuerpo = await respuesta.json().catch(() => ({}));
    return { ok: respuesta.ok, cuerpo };
  };

  useEffect(() => {
    const cargar = async () => {
      if (!localStorage.getItem("token")) {
        salirALogin();
        return;
      }

      try {
        // 1. Perfil
        const { ok, cuerpo } = await api("/api/perfil");
        if (!ok) {
          setMensaje({
            texto: cuerpo.error || "No se pudo cargar tu perfil",
            tipo: "error",
          });
          return;
        }
        setPerfil(cuerpo);
        setForm({
          nombre: cuerpo.nombre || "",
          telefono: cuerpo.telefono || "",
        });

        // 2. Pedidos: la creadora ve todos, el cliente solo los suyos
        const admin = cuerpo.rol === "admin";
        const resultado = await api(admin ? "/api/pedidos" : "/api/pedidos/mios");
        setPedidos(
          resultado.ok && Array.isArray(resultado.cuerpo) ? resultado.cuerpo : []
        );
      } catch (error) {
        if (error.message !== "sesion") {
          setMensaje({
            texto: "No se pudo conectar con el servidor",
            tipo: "error",
          });
        }
      } finally {
        setCargandoPedidos(false);
      }
    };

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarEstado = async (pedido, nuevoEstado) => {
    try {
      const { ok, cuerpo } = await api("/api/pedidos/" + pedido._id, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!ok) {
        alert(cuerpo.error || "No se pudo cambiar el estado");
        return;
      }
      setPedidos((actuales) =>
        actuales.map((p) =>
          p._id === pedido._id ? { ...p, estado: nuevoEstado } : p
        )
      );
    } catch (error) {
      // si fue por sesión vencida, ya se redirigió al login
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      const { ok, cuerpo } = await api("/api/perfil", {
        method: "PUT",
        body: JSON.stringify({ nombre: form.nombre, telefono: form.telefono }),
      });

      if (!ok) {
        setMensaje({
          texto: cuerpo.error || "No se pudieron guardar los cambios",
          tipo: "error",
        });
        return;
      }

      let guardado = {};
      try {
        guardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      } catch (error) {
        guardado = {};
      }
      guardado.nombre = cuerpo.nombre;
      localStorage.setItem("usuario", JSON.stringify(guardado));
      window.dispatchEvent(new Event("sesion-cambio"));

      setMensaje({ texto: "Cambios guardados", tipo: "ok" });
    } catch (error) {
      if (error.message !== "sesion") {
        setMensaje({
          texto: "No se pudo conectar con el servidor",
          tipo: "error",
        });
      }
    }
  };

  const primerNombre = perfil?.nombre ? perfil.nombre.split(" ")[0] : "";

  return (
    <section id="perfil" className="main-section">
      {/* 1. SALUDO */}
      <div className="section-title-wrapper">
        <h2 id="perfil-titulo">
          {perfil
            ? (esAdmin ? "Panel admin · " : "Hola, ") + primerNombre
            : "Mi perfil"}
        </h2>
      </div>

      {/* 2. PEDIDOS */}
      <h3 id="pedidos-titulo" style={{ fontFamily: "var(--fuente-titulo)" }}>
        {esAdmin ? "Todos los pedidos" : "Mis pedidos"}
      </h3>

      <div id="lista-pedidos" className="sobre-grid">
        {!cargandoPedidos && pedidos.length === 0 && (
          <p>
            {esAdmin
              ? "Todavía no hay pedidos."
              : "Todavía no has hecho pedidos."}
          </p>
        )}

        {pedidos.map((pedido) => (
          <div className="info-card" key={pedido._id}>
            <h3>{pedido.producto}</h3>

            {esAdmin && (
              <>
                <p>Cliente: {pedido.nombreCliente}</p>
                <p>Teléfono: {pedido.telefono}</p>
                {pedido.usuario && pedido.usuario.email && (
                  <p>Cuenta: {pedido.usuario.email}</p>
                )}
              </>
            )}

            <p>
              Fecha:{" "}
              {new Date(pedido.fecha).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            {esAdmin ? (
              <label>
                Estado:{" "}
                <select
                  value={pedido.estado}
                  onChange={(e) => cambiarEstado(pedido, e.target.value)}
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p>Estado: {pedido.estado}</p>
            )}
          </div>
        ))}
      </div>

      {/* 3. DATOS */}
      <p
        id="mensaje-perfil"
        style={{
          marginTop: "40px",
          color: mensaje.tipo === "error" ? "#b3261e" : "#2e7d32",
          fontWeight: 600,
        }}
      >
        {mensaje.texto}
      </p>

      <form id="form-perfil" className="contacto-form" onSubmit={guardar}>
        <fieldset>
          <legend id="perfil-legend">
            {esAdmin ? "Perfil de la creadora" : "Mis datos"}
          </legend>

          <div className="form-group">
            <label htmlFor="perfil-email">Correo:</label>
            <input
              type="email"
              id="perfil-email"
              value={perfil?.email || ""}
              disabled
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="perfil-nombre">Nombre:</label>
            <input
              type="text"
              id="perfil-nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="perfil-telefono">Teléfono:</label>
            <input
              type="tel"
              id="perfil-telefono"
              placeholder="Ej: 3001234567"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-hero">
              Guardar cambios
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}

export default Perfil;
