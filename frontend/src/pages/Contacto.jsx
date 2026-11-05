import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

const NUMERO_WHATSAPP = "573222392766";

function Contacto() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    producto: searchParams.get("producto") || "",
  });

  // Con sesión iniciada, nombre y teléfono salen del perfil
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/perfil", { headers: { Authorization: "Bearer " + token } })
      .then((res) => (res.ok ? res.json() : null))
      .then((perfil) => {
        if (!perfil) return;
        setForm((actual) => ({
          ...actual,
          nombre: actual.nombre || perfil.nombre || "",
          telefono: actual.telefono || perfil.telefono || "",
        }));
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const limpiar = () => {
    setForm({ nombre: "", telefono: "", producto: "" });
  };

  const irALogin = () => {
    const volver = location.pathname + location.search;
    navigate("/login?volver=" + encodeURIComponent(volver));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombre = form.nombre.trim();
    const telefono = form.telefono.trim();
    const producto = form.producto.trim();

    if (!nombre || !telefono || !producto) {
      alert("Escribe tu nombre, tu teléfono y el producto que quieres.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Para hacer un pedido primero inicia sesión o crea tu cuenta.");
      irALogin();
      return;
    }

    // Se abre la ventana dentro del clic para que el navegador no la bloquee
    const ventana = window.open("", "_blank");

    try {
      const respuesta = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ nombre, telefono, producto }),
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (respuesta.status === 401) {
        if (ventana) ventana.close();
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        alert("Tu sesión venció. Inicia sesión de nuevo.");
        irALogin();
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
  };

  return (
    <section id="contacto" className="main-section">
      <div className="section-title-wrapper">
        <h2>Contáctanos</h2>
      </div>

      <form className="contacto-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Haz tu pedido</legend>

          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono de contacto:</label>
            <input
              type="tel"
              id="telefono"
              placeholder="Ej: 3001234567"
              value={form.telefono}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="producto">Producto:</label>
            <input
              type="text"
              id="producto"
              placeholder="Bolso Granny, Bufanda Dos Tonos, etc."
              value={form.producto}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-hero btn-whatsapp">Pedir </button>
         <input type="reset" value="Limpiar" onClick={limpiar} />
         </div>
        </fieldset>
      </form>
    </section>
  );
}

export default Contacto;