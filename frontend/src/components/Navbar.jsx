import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch (error) {
    return null;
  }
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(leerUsuario());

  // Se actualiza cuando alguien inicia o cierra sesión
  useEffect(() => {
    const actualizar = () => setUsuario(leerUsuario());
    window.addEventListener("sesion-cambio", actualizar);
    return () => window.removeEventListener("sesion-cambio", actualizar);
  }, []);

  const cerrarSesion = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/");
  };

  // Si ya estamos en /login, se conserva el ?volver=
  const extra = location.pathname === "/login" ? location.search : "";

  return (
    <header className="main-header">
      <div className="header-logo">
        <Link to="/">
          <img src="/assets/img/milachet_letras.png" alt="Logo de Milachet" />
        </Link>
      </div>
      <nav className="main-nav">
        <ul className="menu">
          <li>
            <NavLink to="/" end className="menu-link">Inicio</NavLink>
          </li>
          <li>
            <NavLink to="/sobre" className="menu-link">Sobre nosotros</NavLink>
          </li>
          <li>
            <NavLink to="/productos" className="menu-link">Productos</NavLink>
          </li>
          <li>
            <NavLink to="/contacto" className="menu-link">Contacto</NavLink>
          </li>

          {usuario ? (
            <>
              <li>
                <Link to="/perfil" className="btn-hero">
                  {usuario.rol === "admin" ? "Panel admin" : "Mi perfil"}
                </Link>
              </li>
              <li>
                <a href="#" className="btn-hero" onClick={cerrarSesion}>
                  Cerrar sesión
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to={"/login" + extra} className="btn-hero">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link to={"/login" + extra + "#registro"} className="btn-hero">
                  Crear cuenta
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;