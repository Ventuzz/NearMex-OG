import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { destinations } from '../data/destinations';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

/**
 * Página de Detalle del Destino.
 * Muestra información completa de un destino, incluyendo mapa (placeholder) y sistema de reseñas
 */
const Destinations = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [destination, setDestination] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [editingReview, setEditingReview] = useState(null);

    // Efecto para cargar datos del destino y verificar si es favorito al cambiar el ID
    useEffect(() => {
        const found = destinations.find(d => d.id === id);
        setDestination(found);

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));

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

    // Maneja la acción de agregar/quitar favoritos (ahorita solo en localStorage)
    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavorites;
        if (isFavorite) {
            newFavorites = favorites.filter(favId => favId !== id);
        } else {
            newFavorites = [...favorites, id];
        }
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

    // Envía una nueva reseña al servidor
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reviews', {
                destinationId: id,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            alert('Error al enviar reseña');
        }
    };

    // Actualiza una reseña existente en el servidor
    const handleUpdateReview = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/reviews/${editingReview.id}`, {
                rating: newReview.rating,
                comment: newReview.comment
            });
            setEditingReview(null);
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            alert('Error al actualizar reseña');
        }
    };

    // Elimina una reseña del servidor
    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('¿Estás seguro de eliminar esta reseña?')) {
            try {
                await api.delete(`/reviews/${reviewId}`);
                fetchReviews();
            } catch (error) {
                alert('Error al eliminar reseña');
            }
        }
    };

    if (!destination) {
        return (
            <div className="container" style={{ marginTop: '150px', textAlign: 'center' }}>
                <h2>Destino no encontrado</h2>
                <Link to="/catalog" className="btn btn-primary mt-3">Volver al Catálogo</Link>
            </div>
        );
    }

    const relatedDestinations = destinations
        .filter(d => d.id !== id)
        .slice(0, 4);

    return (
        <>
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
                                <span style={{ color: '#660000' }}>
                                    Etiquetas: {destination.tags.map((tag, i) => (
                                        <React.Fragment key={i}>
                                            <span style={{ color: '#660000' }}>{tag}</span>
                                            {i < destination.tags.length - 1 ? ', ' : ''}
                                        </React.Fragment>
                                    ))}
                                </span>
                            </div>
                            <p style={{ fontSize: '20px' }}>{destination.description}</p>

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
                                    <i className={`fa ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`}></i> {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
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
                                                <button className="nav-link active" id="map-tab" data-bs-toggle="tab" data-bs-target="#map" type="button" role="tab" aria-controls="map" aria-selected="true">Mapa</button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false">Reseñas ({reviews.length})</button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="tab-content" id="myTabContent">
                                        <div className="tab-pane fade show active" id="map" role="tabpanel" aria-labelledby="map-tab">
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Mapa próximamente</div>
                                        </div>
                                        <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
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
                                                                <option value="4">4 - Muy bueno</option>
                                                                <option value="3">3 - Bueno</option>
                                                                <option value="2">2 - Regular</option>
                                                                <option value="1">1 - Malo</option>
                                                            </select>
                                                        </div>
                                                        <div className="mb-3">
                                                            <textarea
                                                                className="form-control"
                                                                placeholder="Escribe tu opinión..."
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
                                                            <div>
                                                                <strong style={{ fontSize: '1.1em' }}>{review.username}</strong>
                                                                <span className="text-warning ms-2">{'★'.repeat(review.rating)}</span>
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
                                                                        style={{ color: '#ee626b' }}
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
                                                                        <option value="4">4 - Muy bueno</option>
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
                                                                    <button type="submit" className="btn btn-primary btn-sm me-2" style={{ backgroundColor: '#660000', borderColor: '#660000' }}>Guardar</button>
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
                                                <p>No hay reseñas aún. ¡Sé el primero en opinar!</p>
                                            )}
                                            {!user && (
                                                <div className="alert" style={{ backgroundColor: 'rgba(102, 0, 0, 0.1)', color: '#660000', borderColor: '#660000' }}>
                                                    <Link to="/login" style={{ color: '#660000', fontWeight: 'bold' }}>Inicia sesión</Link> para escribir una reseña.
                                                </div>
                                            )}
                                        </div>
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
                                <h6>Turismo</h6>
                                <h2>También te puede interesar</h2>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="main-button">
                                <Link to="/catalog">Ver Todos</Link>
                            </div>
                        </div>
                        {relatedDestinations.map((item) => (
                            <div className="col-lg col-sm-6 col-xs-12" key={item.id}>
                                <div className="item">
                                    <h4>{item.category}</h4>
                                    <div className="thumb">
                                        <Link to={`/destination/${item.id}`}><img src={item.image} alt={item.name} /></Link>
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

export default Destinations;
