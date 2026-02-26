import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import { motion } from 'framer-motion';
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
            navigate(`/destination/${destinationId}`);
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
                                        <h6 style={{ fontSize: '24px' }}>Descubre lo mejor de Guadalajara</h6>
                                        <h2 style={{ position: 'relative', display: 'inline-block', fontSize: '56px' }}>
                                            ¡Hola, {user.username}!
                                        </h2>
                                        <p style={{ fontSize: '22px', marginTop: '10px' }}>Descubre tu próximo destino y vive una experiencia inolvidable. Explora nuestras recomendaciones y encuentra los destinos perfectos para ti.</p>
                                        <div className="search-input">
                                            <div className="main-button">
                                                <Link to="/catalog">encontrar destinos</Link>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h6 style={{ fontSize: '24px' }}>Encuentra tu próximo destino</h6>
                                        <h2 style={{ position: 'relative', display: 'inline-block', fontSize: '56px' }}>
                                            Descubre lo mejor de Guadalajara
                                        </h2>
                                        <p style={{ fontSize: '22px', marginTop: '10px' }}>Busca tu próximo destino o explora nuestras recomendaciones.</p>
                                        <div className="search-input">
                                            <div className="main-button">
                                                <Link to="/register">Regístrate para ver todo</Link>
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
                                <h6>Tendencias</h6>
                                <h2>Destinos Tendencia</h2>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="main-button">
                                {user && (
                                    <Link to="/catalog">Ver todos los destinos</Link>
                                )}
                            </div>
                        </div>
                        {/* Renderizar los primeros 4 destinos como destacados */}
                        {loading ? (
                            <div className="col-12 text-center" style={{ margin: '40px 0' }}>
                                <p>Cargando destinos...</p>
                            </div>
                        ) : (
                            destinations.slice(0, 4).map((item, index) => (
                                <motion.div
                                    className="col-lg-3 col-md-6"
                                    key={item.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
                                >
                                    <div
                                        className="item"
                                        onClick={(e) => handleDestinationClick(e, item.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="thumb">
                                            <div>
                                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '15px' }} />
                                            </div>
                                        </div>
                                        <div className="down-content">
                                            <span className="category">{item.category}</span>
                                            <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', paddingRight: '45px' }}>{item.name}</h4>
                                            <div style={{
                                                backgroundColor: '#660000',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                color: '#fff',
                                                position: 'absolute',
                                                right: '15px',
                                                bottom: '30px',
                                                transition: 'all 0.3s'
                                            }} className="catalog-arrow"
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8f030c'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#660000'}>
                                                <i className="fa fa-arrow-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;
