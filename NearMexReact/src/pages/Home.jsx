import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import api from '../services/api';

/**
 * Página de Inicio.
 * Muestra el banner principal y secciones destacadas.
 */
const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await api.get('/destinations');
                setDestinations(response.data);
            } catch (error) {
                console.error("Error fetching destinations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    const handleDestinationClick = (e, destinationId) => {
        if (!user) {
            e.preventDefault();
            Swal.fire({
                title: '¡Inicia sesión!',
                text: 'Por favor, regístrate o inicia sesión para acceder a todas las funciones y ver los detalles de los destinos.',
                icon: 'info',
                iconColor: '#8f030c',
                showCancelButton: true,
                confirmButtonColor: '#8f030c',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Ir a Registrarse / Iniciar Sesión',
                cancelButtonText: 'Cancelar',
                returnFocus: false
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/register');
                }
            });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <PageTransition>
            {/* Sección del Banner Principal */}
            <div className="main-banner">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 align-self-center">
                            <div className="caption header-text">
                                {user ? (
                                    <>
                                        <h6>Bienvenido de nuevo</h6>
                                        <h2>¡Hola, {user.username}!</h2>
                                        <p style={{ fontSize: '22px' }}>¿Listo para tu próxima aventura? Explora nuestro catálogo y descubre los rincones más increíbles que tenemos para ti.</p>
                                        <div className="search-input">
                                            <div className="main-button">
                                                <Link to="/catalog">Ir al Catálogo</Link>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h6>Descubre tu siguiente destino</h6>
                                        <h2>¡No puedes perderte esto!</h2>
                                        <p style={{ fontSize: '22px' }}>NearMex es tu plataforma confiable para descubrir destinos increíbles y experiencias únicas. Explora y disfruta de tus próximas aventuras con nosotros.</p>
                                        <div className="search-input">
                                            <div className="main-button">
                                                <Link to="/register">Registrate para acceder a todas las funciones</Link>
                                            </div>
                                        </div>
                                    </>
                                )}
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
                                {user && (
                                    <Link to="/catalog">Ver más</Link>
                                )}
                            </div>
                        </div>
                        {/* Renderizar los primeros 4 destinos como destacados */}
                        {loading ? (
                            <div className="col-12 text-center" style={{ margin: '40px 0' }}>
                                <p>Cargando destinos en tendencia...</p>
                            </div>
                        ) : (
                            destinations.slice(0, 4).map((item) => (
                                <div className="col-lg-3 col-md-6" key={item.id}>
                                    <div className="item">
                                        <div className="thumb">
                                            <Link to={`/destination/${item.id}`} onClick={(e) => handleDestinationClick(e, item.id)}>
                                                <img src={item.image} alt={item.name} />
                                            </Link>
                                        </div>
                                        <div className="down-content">
                                            <span className="category">{item.category}</span>
                                            <h4>{item.name}</h4>
                                            <Link to={`/destination/${item.id}`} onClick={(e) => handleDestinationClick(e, item.id)}>
                                                <i className="fa fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;
