import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

function destinoSeguro(volver) {
  // Solo rutas internas del sitio, por ejemplo /contacto?producto=Bolso
  return volver && /^\/[\w-]*(\?\S*)?$/.test(volver) ? volver : "/";
}

async function enviarAuth(ruta, datos) {
  const respuesta = await fetch(ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  return { ok: respuesta.ok, cuerpo };
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [panel, setPanel] = useState(
    location.hash === "#registro" ? "registro" : "login"
  );
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [login, setLogin] = useState({ email: "", password: "" });
  const [registro, setRegistro] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  // Cambia de panel cuando cambia el #registro de la URL
  useEffect(() => {
    setPanel(location.hash === "#registro" ? "registro" : "login");
    setMensaje({ texto: "", tipo: "" });
  }, [location.hash]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { ok, cuerpo } = await enviarAuth("/api/auth/login", {
        email: login.email.trim(),
        password: login.password,
      });

      if (!ok) {
        setMensaje({
          texto: cuerpo.error || "No se pudo iniciar sesión",
          tipo: "error",
        });
        return;
      }

      localStorage.setItem("token", cuerpo.token);
      localStorage.setItem("usuario", JSON.stringify(cuerpo.usuario));
      // Avisa al Navbar para que cambie los botones
      window.dispatchEvent(new Event("sesion-cambio"));
      navigate(destinoSeguro(searchParams.get("volver")));
    } catch (error) {
      setMensaje({ texto: "No se pudo conectar con el servidor", tipo: "error" });
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    try {
      const { ok, cuerpo } = await enviarAuth("/api/auth/registro", {
        nombre: registro.nombre.trim(),
        email: registro.email.trim(),
        password: registro.password,
      });

      if (!ok) {
        setMensaje({
          texto: cuerpo.error || "No se pudo crear la cuenta",
          tipo: "error",
        });
        return;
      }

      setLogin({ email: registro.email.trim(), password: "" });
      setRegistro({ nombre: "", email: "", password: "" });
      navigate(location.pathname + location.search, { replace: true });
      setPanel("login");
      setMensaje({ texto: "Cuenta creada. Ahora inicia sesión.", tipo: "ok" });
    } catch (error) {
      setMensaje({ texto: "No se pudo conectar con el servidor", tipo: "error" });
    }
  };

  return (
    <section id="login" className="main-section">
      <div className="section-title-wrapper">
        <h2>Mi cuenta</h2>
      </div>

      <p
        id="mensaje-auth"
        style={{
          color: mensaje.tipo === "error" ? "#b3261e" : "#2e7d32",
          fontWeight: 600,
        }}
      >
        {mensaje.texto}
      </p>

      {/* INICIAR SESIÓN */}
      <form
        id="form-login"
        className="contacto-form"
        onSubmit={handleLogin}
        hidden={panel !== "login"}
      >
        <fieldset>
          <legend>Iniciar sesión</legend>

          <div className="form-group">
            <label htmlFor="login-email">Correo:</label>
            <input
              type="email"
              id="login-email"
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Contraseña:</label>
            <input
              type="password"
              id="login-password"
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-hero">
              Entrar
            </button>
          </div>
        </fieldset>
      </form>

      {/* CREAR CUENTA */}
      <form
        id="form-registro"
        className="contacto-form"
        onSubmit={handleRegistro}
        hidden={panel !== "registro"}
      >
        <fieldset>
          <legend>Crear cuenta</legend>

          <div className="form-group">
            <label htmlFor="registro-nombre">Nombre:</label>
            <input
              type="text"
              id="registro-nombre"
              value={registro.nombre}
              onChange={(e) =>
                setRegistro({ ...registro, nombre: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="registro-email">Correo:</label>
            <input
              type="email"
              id="registro-email"
              value={registro.email}
              onChange={(e) =>
                setRegistro({ ...registro, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="registro-password">
              Contraseña (mínimo 6 caracteres):
            </label>
            <input
              type="password"
              id="registro-password"
              minLength={6}
              value={registro.password}
              onChange={(e) =>
                setRegistro({ ...registro, password: e.target.value })
              }
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-hero">
              Crear mi cuenta
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}

export default Login;