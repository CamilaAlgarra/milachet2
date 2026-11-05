import { Link } from "react-router-dom";

function Inicio() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h3>Bienvenido a Milachet</h3>
        <h2>Creaciones únicas hechas a crochet</h2>
        <p>
          Diseños artesanales personalizados con amor, creatividad y
          dedicación para acompañar tus momentos favoritos.
        </p>
        <div className="hero-buttons">
          <Link to="/productos" className="btn-hero">
            Ver productos
          </Link>
          <Link to="/sobre" className="btn-hero btn-hero-outline">
            Conócenos
          </Link>
        </div>
      </div>
      <div className="hero-image-container logo-frame">
        <img src="/assets/img/Milachet_blanco.png" alt="Logo de Milachet" />
      </div>
    </section>
  );
}

export default Inicio;