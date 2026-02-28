import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageTransition from '../components/common/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

/**
 * Página de Detalle del Destino.
 * Muestra información completa de un destino, incluyendo mapa (placeholder) y sistema de reseñas
 */
const Destinations = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [relatedDestinations, setRelatedDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [editingReview, setEditingReview] = useState(null);
    const [activeTab, setActiveTab] = useState('map');

    const handleDestinationClick = (e, destinationId) => {
        if (!user) {
            e.preventDefault();
            Swal.fire({
                title: '¡Inicia sesión!',
                text: 'Debes iniciar sesión para ver los detalles completos, guardar en favoritos o escribir reseñas.',
                icon: 'info',
                iconColor: '#8f030c',
                showCancelButton: true,
                confirmButtonColor: '#8f030c',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Ir a Iniciar Sesión',
                cancelButtonText: 'Cancelar',
                returnFocus: false
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/register');
                }
            });
        } else {
            // Scroll suave hacia arriba cuando navega
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Efecto para cargar datos del destino y verificar si es favorito al cambiar el ID
    useEffect(() => {
        const fetchDestinationData = async () => {
            setLoading(true);
            try {
                // Obtener los datos del destino
                const destResponse = await api.get(`/destinations/${id}`);
                setDestination(destResponse.data);

                // Obtener todos los destinos para elegir los relacionados
                const allResponse = await api.get('/destinations');
                const related = allResponse.data.filter(d => String(d.id) !== id).slice(0, 4);
                setRelatedDestinations(related);

                // Verificar si el destino ya es favorito consultando la API
                if (user) {
                    const favRes = await api.get('/favorites/ids');
                    setIsFavorite(favRes.data.includes(id));
                }

            } catch (error) {
                console.error("Error fetching destination data:", error);
                setDestination(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinationData();
        fetchReviews();
    }, [id]);

    // Función para obtener reseñas desde el servidor
    const fetchReviews = async () => {
        try {
            const response = await api.get(`/reviews/${id}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    // Maneja la acción de agregar/quitar favoritos usando la API
    const toggleFavorite = async () => {
        if (!user) return;

        try {
            if (isFavorite) {
                await api.delete(`/favorites/${id}`);
            } else {
                await api.post('/favorites', { destinationId: id });
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error('Error al actualizar favorito:', err);
        }
    };

    // Envía una nueva reseña al servidor con confirmación
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        Swal.fire({
            title: '¿Enviar reseña?',
            text: 'Tu reseña será pública para todos los usuarios.',
            icon: 'question',
            iconColor: '#660000',
            showCancelButton: true,
            confirmButtonColor: '#660000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, enviar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.post('/reviews', {
                        destinationId: id,
                        rating: newReview.rating,
                        comment: newReview.comment
                    });
                    setNewReview({ rating: 5, comment: '' });
                    fetchReviews();
                    Swal.fire({
                        title: '¡Enviada!',
                        text: 'Gracias por tu reseña.',
                        icon: 'success',
                        iconColor: '#660000',
                        confirmButtonColor: '#660000'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al enviar tu reseña.',
                        icon: 'error',
                        confirmButtonColor: '#660000'
                    });
                }
            }
        });
    };

    // Actualiza una reseña existente en el servidor
    const handleUpdateReview = async (e) => {
        e.preventDefault();

        Swal.fire({
            title: '¿Guardar cambios?',
            text: 'Se actualizará tu reseña anterior.',
            icon: 'question',
            iconColor: '#660000',
            showCancelButton: true,
            confirmButtonColor: '#660000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.put(`/reviews/${editingReview.id}`, {
                        rating: newReview.rating,
                        comment: newReview.comment
                    });
                    setEditingReview(null);
                    setNewReview({ rating: 5, comment: '' });
                    fetchReviews();
                    Swal.fire({
                        title: '¡Actualizado!',
                        text: 'Tu reseña ha sido modificada.',
                        icon: 'success',
                        iconColor: '#660000',
                        confirmButtonColor: '#660000'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al actualizar tu reseña.',
                        icon: 'error',
                        confirmButtonColor: '#660000'
                    });
                }
            }
        });
    };

    // Elimina una reseña del servidor
    const handleDeleteReview = async (reviewId) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            iconColor: '#660000',
            showCancelButton: true,
            confirmButtonColor: '#660000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            returnFocus: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/reviews/${reviewId}`);
                    fetchReviews();
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'Tu reseña ha sido eliminada.',
                        icon: 'success',
                        iconColor: '#660000',
                        confirmButtonColor: '#660000',
                        returnFocus: false
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un problema al eliminar la reseña.',
                        icon: 'error',
                        confirmButtonColor: '#660000',
                        returnFocus: false
                    });
                }
            }
        });
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="container" style={{ marginTop: '150px', textAlign: 'center' }}>
                    <h2>Cargando...</h2>
                </div>
            </PageTransition>
        );
    }

    if (!destination) {
        return (
            <PageTransition>
                <div className="container" style={{ marginTop: '150px', textAlign: 'center' }}>
                    <h2>Destino no encontrado</h2>
                    <Link to="/catalog" className="btn btn-primary mt-3">Volver al Catálogo</Link>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>{destination.name}</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  <Link to="/catalog">Catálogo</Link>  &gt;  {destination.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="single-product section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="left-image">
                                <img src={destination.image} alt={destination.name} />
                            </div>
                        </div>
                        <div className="col-lg-6 align-self-center">
                            <h4 style={{ fontSize: '33px' }}>{destination.fullName}</h4>
                            <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                                <span style={{ color: '#660000', marginRight: '15px' }}>
                                    Categoría: <Link to="/catalog" state={{ category: destination.category }} style={{ color: '#660000', textDecoration: 'none' }}>{destination.category}</Link>
                                </span>
                                {destination.tags && destination.tags.length > 0 && (
                                    <span style={{ color: '#660000' }}>
                                        Etiquetas: {destination.tags.map((tag, i) => (
                                            <React.Fragment key={i}>
                                                <span style={{ color: '#660000' }}>{tag}</span>
                                                {i < destination.tags.length - 1 ? ', ' : ''}
                                            </React.Fragment>
                                        ))}
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: '20px', marginBottom: '15px' }}>{destination.description}</p>
                            {destination.schedule && (
                                <div style={{ fontSize: '18px', color: '#666', marginBottom: '30px', display: 'flex', alignItems: 'center', marginLeft: '-6px' }}>
                                    <i className="fa fa-clock-o" style={{ color: '#660000', marginRight: '8px', fontSize: '20px' }}></i>
                                    <span><strong>Horario:</strong> {destination.schedule}</span>
                                </div>
                            )}

                            <div className="main-button">
                                <button
                                    onClick={toggleFavorite}
                                    style={{
                                        backgroundColor: isFavorite ? '#ee626b' : '#660000',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 30px',
                                        borderRadius: '25px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        fontSize: '18px',
                                        transition: 'all .3s'
                                    }}
                                >
                                    <i className={`fa ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`}></i> {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-12">
                            <div className="sep"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="more-info">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tabs-content">
                                <div className="row">
                                    <div className="nav-wrapper ">
                                        <ul className="nav nav-tabs" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className={`nav-link ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')} type="button" role="tab">Mapa</button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')} type="button" role="tab">Reseñas ({reviews.length})</button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="tab-content" id="myTabContent" style={{ overflow: 'hidden', position: 'relative', minHeight: '400px' }}>
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'map' && (
                                                <motion.div
                                                    key="map"
                                                    initial={{ opacity: 0, x: -30 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 30 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="tab-pane show active"
                                                    style={{ display: 'block' }}
                                                >
                                                    <div style={{ width: '100%', height: '400px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                                        <iframe
                                                            title={`Mapa de ${destination.name}`}
                                                            width="100%"
                                                            height="100%"
                                                            style={{ border: 0 }}
                                                            loading="lazy"
                                                            allowFullScreen
                                                            referrerPolicy="no-referrer-when-downgrade"
                                                            src={(() => {
                                                                if (destination.map_url && destination.map_url.includes('<iframe')) {
                                                                    const match = destination.map_url.match(/src="([^"]+)"/);
                                                                    if (match && match[1]) return match[1];
                                                                }
                                                                return destination.map_url || `https://maps.google.com/maps?q=${encodeURIComponent(destination.category + ' ' + (destination.fullName || destination.name) + ', Guadalajara, Jalisco, Mexico')}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
                                                            })()}
                                                        ></iframe>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {activeTab === 'reviews' && (
                                                <motion.div
                                                    key="reviews"
                                                    initial={{ opacity: 0, x: 30 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -30 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="tab-pane show active"
                                                    style={{ display: 'block' }}
                                                >
                                                    {user && !editingReview && (
                                                        <div className="mb-4">
                                                            <h5>Escribe una reseña</h5>
                                                            <form onSubmit={handleSubmitReview}>
                                                                <div className="mb-3">
                                                                    <label>Calificación:</label>
                                                                    <select
                                                                        className="form-control"
                                                                        value={newReview.rating}
                                                                        onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                                                                    >
                                                                        <option value="5">5 - Excelente</option>
                                                                        <option value="4">4 - Muy Bueno</option>
                                                                        <option value="3">3 - Bueno</option>
                                                                        <option value="2">2 - Regular</option>
                                                                        <option value="1">1 - Malo</option>
                                                                    </select>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <textarea
                                                                        className="form-control"
                                                                        placeholder="Cuéntale a otros sobre tu experiencia..."
                                                                        value={newReview.comment}
                                                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                                        required
                                                                    ></textarea>
                                                                </div>
                                                                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#660000', borderColor: '#660000' }}>Enviar Reseña</button>
                                                            </form>
                                                            <hr />
                                                        </div>
                                                    )}

                                                    {reviews.length > 0 ? (
                                                        reviews.map((review) => (
                                                            <div key={review.id} className="mb-4 p-3 shadow-sm rounded bg-light" style={{ position: 'relative' }}>
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <div className="d-flex align-items-center">
                                                                        {(user && user.userId === review.user_id && user.avatar) || review.avatar ? (
                                                                            <img src={(user && user.userId === review.user_id && user.avatar) ? user.avatar : review.avatar} alt={review.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '10px' }} />
                                                                        ) : (
                                                                            <i className="fa fa-user-circle" style={{ fontSize: '40px', color: '#ccc', marginRight: '10px' }}></i>
                                                                        )}
                                                                        <div>
                                                                            <strong style={{ fontSize: '1.1em', display: 'block', marginBottom: '-5px' }}>
                                                                                {review.username}
                                                                                {review.updated_at && review.created_at && new Date(review.updated_at) > new Date(review.created_at) && (
                                                                                    <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '5px', fontWeight: 'normal' }}>(Editado)</span>
                                                                                )}
                                                                            </strong>
                                                                            <span className="text-warning">{'★'.repeat(review.rating)}</span>
                                                                        </div>
                                                                    </div>
                                                                    {user && user.userId === review.user_id && (
                                                                        <div>
                                                                            <button
                                                                                className="btn btn-link p-0 me-2"
                                                                                onClick={() => {
                                                                                    setEditingReview(review);
                                                                                    setNewReview({ rating: review.rating, comment: review.comment });
                                                                                }}
                                                                                style={{ color: '#660000' }}
                                                                            >
                                                                                <i className="fa fa-pencil"></i>
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-link p-0"
                                                                                onClick={() => handleDeleteReview(review.id)}
                                                                                style={{ color: '#660000' }}
                                                                            >
                                                                                <i className="fa fa-trash"></i>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {editingReview && editingReview.id === review.id ? (
                                                                    <form onSubmit={handleUpdateReview}>
                                                                        <div className="mb-2">
                                                                            <select
                                                                                className="form-control mb-2"
                                                                                value={newReview.rating}
                                                                                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                                                                            >
                                                                                <option value="5">5 - Excelente</option>
                                                                                <option value="4">4 - Muy Bueno</option>
                                                                                <option value="3">3 - Bueno</option>
                                                                                <option value="2">2 - Regular</option>
                                                                                <option value="1">1 - Malo</option>
                                                                            </select>
                                                                            <textarea
                                                                                className="form-control mb-2"
                                                                                value={newReview.comment}
                                                                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                                                required
                                                                            ></textarea>
                                                                            <button type="submit" className="btn btn-primary btn-sm me-2" style={{ backgroundColor: '#660000', borderColor: '#660000' }}>Guardar Cambios</button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-secondary btn-sm"
                                                                                onClick={() => {
                                                                                    setEditingReview(null);
                                                                                    setNewReview({ rating: 5, comment: '' });
                                                                                }}
                                                                            >
                                                                                Cancelar
                                                                            </button>
                                                                        </div>
                                                                    </form>
                                                                ) : (
                                                                    <p style={{ margin: 0 }}>{review.comment}</p>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p>Aún no hay reseñas para este destino. ¡Sé el primero!</p>
                                                    )}
                                                    {!user && (
                                                        <div className="alert" style={{ backgroundColor: 'rgba(102, 0, 0, 0.1)', color: '#660000', borderColor: '#660000' }}>
                                                            Para escribir una reseña necesitas <Link to="/login" style={{ color: '#660000', fontWeight: 'bold' }}>Iniciar Sesión</Link>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section categories related-games">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="section-heading">
                                <h6>Relacionados de la misma categoría</h6>
                                <h2>También te podría interesar</h2>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="main-button">
                                {user && (
                                    <Link to="/catalog">Ver todo el catálogo</Link>
                                )}
                            </div>
                        </div>
                        {relatedDestinations.map((item) => (
                            <div className="col-lg col-sm-6 col-xs-12" key={item.id}>
                                <div className="item">
                                    <h4>{item.category}</h4>
                                    <div className="thumb">
                                        <Link to={`/destination/${item.id}`} onClick={(e) => handleDestinationClick(e, item.id)}>
                                            <img src={item.image} alt={item.name} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Destinations;
