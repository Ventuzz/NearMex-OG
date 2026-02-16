import React from 'react';
import { Link } from 'react-router-dom';
import { destinations } from '../data/destinations';

/**
 * Página de Inicio.
 * Muestra el banner principal y secciones destacadas.
 */
const Home = () => {
    return (
        <>
            {/* Sección del Banner Principal */}
            <div className="main-banner">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 align-self-center">
                            <div className="caption header-text">
                                <h6>Descubre tu siguiente destino</h6>
                                <h2>¡No puedes perderte esto!</h2>
                                <p style={{ fontSize: '22px' }}>NearMex es tu plataforma confiable para descubrir destinos increíbles y experiencias únicas. Explora y disfruta de tus próximas aventuras con nosotros.</p>
                                <div className="search-input">
                                    <div className="main-button">
                                        <Link to="/register">Registrate para acceder a todas las funciones</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 offset-lg-0.5">
                            <div className="right-image">
                                <img src="/assets/images/banner-image.jpg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Destinos en Tendencia */}
            <div className="section trending">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="section-heading">
                                <h6>Tendencia</h6>
                                <h2>Lugares en Tendencia</h2>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="main-button">
                                <Link to="/catalog">Ver más</Link>
                            </div>
                        </div>
                        {/* Renderizar los primeros 4 destinos como destacados */}
                        {destinations.slice(0, 4).map((item) => (
                            <div className="col-lg-3 col-md-6" key={item.id}>
                                <div className="item">
                                    <div className="thumb">
                                        <Link to={`/destination/${item.id}`}><img src={item.image} alt={item.name} /></Link>
                                    </div>
                                    <div className="down-content">
                                        <span className="category">{item.category}</span>
                                        <h4>{item.name}</h4>
                                        <Link to={`/destination/${item.id}`}><i className="fa fa-arrow-right"></i></Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


        </>
    );
};

export default Home;
