import { Link, NavLink } from "react-router-dom";

function Navbar() {
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
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;