import { useState } from "react";
import { Link } from "react-router-dom";

const productos = [
  {
    id: "bufanda",
    nombre: "Bufanda",
    descripcion: "Bufanda tejida a crochet con diseño personalizado.",
    precio: "$45.000",
    imagen: "/assets/img/Bufanda-Dos-Colores.jpeg",
    estilos: [
      {
        nombre: "Bufanda Dos Tonos",
        etiqueta: "Bufanda Dos Tonos",
        imagen: "/assets/img/Bufanda-Dos-Colores.jpeg",
      },
    ],
  },
  {
    id: "bolso",
    nombre: "Bolso",
    descripcion: "Bolso tejido a crochet con diseño personalizado.",
    precio: "$65.000",
    imagen: "/assets/img/Bolso-Morado-Flores.jpeg",
    estilos: [
      {
        nombre: "Bolso Morado Flores",
        etiqueta: "Bolso de Flores",
        imagen: "/assets/img/Bolso-Morado-Flores.jpeg",
      },
      {
        nombre: "Bolso Granny",
        etiqueta: "Bolso Granny",
        imagen: "/assets/img/Bolso-Granny.jpeg",
      },
    ],
  },
  {
    id: "llaveros",
    nombre: "Llaveros",
    descripcion: "Llaveros tejidos con diseños personalizados.",
    precio: "Según diseño",
    imagen: "/assets/img/Llavero_personalizado.jpeg",
    estilos: [
      {
        nombre: "Llavero Personalizado",
        etiqueta: "Llavero Personalizado",
        imagen: "/assets/img/logo-final.png",
      },
    ],
  },
  {
    id: "separadores",
    nombre: "Separadores",
    descripcion: "Separadores tejidos a crochet.",
    precio: "$15.000",
    imagen: "/assets/img/Separador-de-Colombia.jpeg",
    estilos: [
      {
        nombre: "Separador Colombia",
        etiqueta: "Separador Colombia",
        imagen: "/assets/img/Separador-de-Colombia.jpeg",
      },
    ],
  },
  {
    id: "aretes",
    nombre: "Aretes",
    descripcion: "Aretes tejidos con diseños personalizados.",
    precio: "$15.000",
    imagen: "/assets/img/Aretes-Circulo-Medio.jpeg",
    estilos: [
      {
        nombre: "Aretes Círculo",
        etiqueta: "Aretes Círculo Medio",
        imagen: "/assets/img/Aretes-Circulo-Medio.jpeg",
      },
      {
        nombre: "Aretes Flor",
        etiqueta: "Aretes Flor",
        imagen: "/assets/img/Aretes-Flor.jpeg",
      },
    ],
  },
];

function Productos() {
  // Estilo elegido por producto: { bolso: "Bolso Granny" }
  const [elegidos, setElegidos] = useState({});
  // Solo un producto con los estilos abiertos a la vez
  const [abierto, setAbierto] = useState(null);

  const elegir = (idProducto, nombreEstilo) => {
    setElegidos({ ...elegidos, [idProducto]: nombreEstilo });
  };

  const alternar = (e, id) => {
    // El evento "toggle" avisa si el <details> quedó abierto o cerrado
    if (e.target.open) {
      setAbierto(id);
    } else if (abierto === id) {
      setAbierto(null);
    }
  };

  return (
    <section id="productos" className="main-section">
      <div className="section-title-wrapper">
        <h2>Productos</h2>
      </div>

      <div className="catalogo">
        {productos.map((p) => {
          const productoPedido = elegidos[p.id] || p.nombre;

          return (
            <div className="producto" key={p.id}>
              <div className="producto-img-placeholder">
                <img src={p.imagen} alt={p.nombre} />
              </div>
              <div className="producto-info">
                <h3>{p.nombre}</h3>
                <p>{p.descripcion}</p>
                <span className="precio">{p.precio}</span>

                <details
                  className="detalles-producto"
                  open={abierto === p.id}
                  onToggle={(e) => alternar(e, p.id)}
                >
                  <summary className="btn-hero">Ver Estilos</summary>
                  <div className="contenido-desplegable">
                    <p className="titulo-estilos">Estilos:</p>
                    <div className="mini-galeria active-galeria">
                      {p.estilos.map((estilo) => (
                        <figure
                          key={estilo.nombre}
                          className={
                            "item-galeria" +
                            (elegidos[p.id] === estilo.nombre
                              ? " foto-seleccionada"
                              : "")
                          }
                        >
                          <img
                            src={estilo.imagen}
                            alt={estilo.nombre}
                            onClick={() => elegir(p.id, estilo.nombre)}
                          />
                          <figcaption>{estilo.etiqueta}</figcaption>
                        </figure>
                      ))}
                    </div>
                    <Link
                      to={"/contacto?producto=" + encodeURIComponent(productoPedido)}
                      className="btn-pedir"
                    >
                      Pedir
                    </Link>
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Productos;