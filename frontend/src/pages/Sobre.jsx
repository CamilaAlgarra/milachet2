function Sobre() {
  return (
    <section id="sobre" className="main-section">
      <div className="section-title-wrapper">
        <h2>Sobre nosotros</h2>
      </div>

      <div className="sobre-grid">
        <div className="info-card">
          <h3>¿Qué es Milachet?</h3>
          <p>
            Milachet es un emprendimiento dedicado a la creación y venta de
            productos tejidos a crochet con diseños personalizados.
          </p>
        </div>
        <div className="info-card">
          <h3>Misión</h3>
          <p>
            Diseñar y comercializar productos tejidos a crochet que reflejen
            creatividad, calidad y dedicación.
          </p>
        </div>
        <div className="info-card">
          <h3>Visión</h3>
          <p>
            Ser una marca reconocida por la calidad y creatividad de nuestros
            productos.
          </p>
        </div>
      </div>

      <div className="objetivos-card">
        <h3>Objetivos</h3>
        <ol>
          <li>Ofrecer productos de calidad.</li>
          <li>Generar confianza en nuestros clientes.</li>
          <li>Crear una comunidad de amantes del crochet.</li>
        </ol>
      </div>
    </section>
  );
}

export default Sobre;