import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import PageTransition from '../components/common/PageTransition';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener el parámetro 'tab' de la URL o por defecto 'info'
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'info';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const [profileData, setProfileData] = useState(null);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioInput, setBioInput] = useState('');

    // Efecto para sincronizar la pestaña actual si cambia la URL
    useEffect(() => {
        const tab = queryParams.get('tab');
        if (tab && ['info', 'favorites', 'reviews'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    // Redirigir si no hay usuario (protección)
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Cargar favoritos del localStorage consultando sus datos al servidor
    useEffect(() => {
        const fetchFavoritesData = async () => {
            if (activeTab === 'favorites') {
                const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

                if (savedFavorites.length === 0) {
                    setFavorites([]);
                    return;
                }

                try {
                    const response = await api.get('/destinations');
                    const allDestinations = response.data;
                    const favoriteDestinations = allDestinations.filter(dest => savedFavorites.includes(dest.id));
                    setFavorites(favoriteDestinations);
                } catch (error) {
                    console.error("Error fetching favorites data:", error);
                }
            }
        };

        fetchFavoritesData();
    }, [activeTab]);

    // Cargar datos del perfil completo (incluye bio)
    useEffect(() => {
        if (activeTab === 'info' && user) {
            fetchUserProfile();
        }
    }, [activeTab, user]);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setProfileData(response.data);
            setBioInput(response.data.bio || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSaveBio = async () => {
        try {
            await api.put('/auth/profile', { bio: bioInput });
            setProfileData({ ...profileData, bio: bioInput });
            setIsEditingBio(false);
            Swal.fire({
                title: '¡Actualizado!',
                text: 'Tu biografía ha sido guardada.',
                icon: 'success',
                iconColor: '#660000',
                confirmButtonColor: '#660000',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar la biografía',
                icon: 'error',
                confirmButtonColor: '#660000'
            });
        }
    };

    // Cargar reseñas del usuario desde la API
    useEffect(() => {
        if (activeTab === 'reviews' && user) {
            fetchUserReviews();
        }
    }, [activeTab, user]);

    const fetchUserReviews = async () => {
        setLoadingReviews(true);
        try {
            const response = await api.get('/reviews/user');
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al cargar tus reseñas.',
                icon: 'error',
                confirmButtonColor: '#660000',
            });
        } finally {
            setLoadingReviews(false);
        }
    };

    const removeFavorite = (id) => {
        Swal.fire({
            title: '¿Quitar de favoritos?',
            text: "Este destino ya no aparecerá en tu lista.",
            icon: 'warning',
            iconColor: '#660000',
            showCancelButton: true,
            confirmButtonColor: '#660000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Actualizar state
                const newFavorites = favorites.filter(fav => fav.id !== id);
                setFavorites(newFavorites);

                // Actualizar localStorage
                const savedIds = JSON.parse(localStorage.getItem('favorites')) || [];
                const newIds = savedIds.filter(savedId => savedId !== id);
                localStorage.setItem('favorites', JSON.stringify(newIds));

                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El destino ha sido quitado de rus favoritos.',
                    icon: 'success',
                    iconColor: '#660000',
                    confirmButtonColor: '#660000'
                });
            }
        });
    };

    const deleteReview = async (reviewId) => {
        Swal.fire({
            title: '¿Eliminar reseña?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            iconColor: '#660000',
            showCancelButton: true,
            confirmButtonColor: '#660000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/reviews/${reviewId}`);
                    // Remover de la lista local en vez de hacer otro fetch
                    setReviews(reviews.filter(rev => rev.id !== reviewId));
                    Swal.fire({
                        title: 'Eliminada',
                        text: 'Tu reseña ha sido eliminada correctamente.',
                        icon: 'success',
                        iconColor: '#660000',
                        confirmButtonColor: '#660000'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar la reseña.',
                        icon: 'error',
                        confirmButtonColor: '#660000'
                    });
                }
            }
        });
    };

    const handleTabChange = (tab) => {
        navigate(`/profile?tab=${tab}`);
    };

    if (!user) return null;

    return (
        <PageTransition>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Mi Perfil</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <div className="row">
                    {/* Sidebar Pestañas */}
                    <div className="col-md-3 mb-4">
                        <div className="list-group">
                            <button
                                onClick={() => handleTabChange('info')}
                                className={`list-group-item list-group-item-action ${activeTab === 'info' ? 'active' : ''}`}
                                style={activeTab === 'info' ? { backgroundColor: '#660000', borderColor: '#660000' } : {}}
                            >
                                <i className="fa fa-user me-2"></i> Mi Información
                            </button>
                            <button
                                onClick={() => handleTabChange('favorites')}
                                className={`list-group-item list-group-item-action ${activeTab === 'favorites' ? 'active' : ''}`}
                                style={activeTab === 'favorites' ? { backgroundColor: '#660000', borderColor: '#660000' } : {}}
                            >
                                <i className="fa fa-heart me-2"></i> Mis Favoritos
                            </button>
                            <button
                                onClick={() => handleTabChange('reviews')}
                                className={`list-group-item list-group-item-action ${activeTab === 'reviews' ? 'active' : ''}`}
                                style={activeTab === 'reviews' ? { backgroundColor: '#660000', borderColor: '#660000' } : {}}
                            >
                                <i className="fa fa-star me-2"></i> Mis Reseñas
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="col-md-9">
                        <div className="card shadow-sm">
                            <div className="card-body">

                                {/* Pestaña: Información */}
                                {activeTab === 'info' && (
                                    <div>
                                        <h4 className="border-bottom pb-2 mb-4">Información de Cuenta</h4>
                                        <div className="d-flex align-items-center mb-4">
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                backgroundColor: '#eee',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '32px',
                                                color: '#aaa',
                                                marginRight: '20px'
                                            }}>
                                                <i className="fa fa-user"></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0">{user.username}</h5>
                                                <p className="text-muted mb-0">Miembro de NearMex</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-top">
                                            <h5 className="mb-3">Biografía</h5>
                                            {isEditingBio ? (
                                                <div>
                                                    <textarea
                                                        className="form-control mb-3"
                                                        rows="4"
                                                        value={bioInput}
                                                        onChange={(e) => setBioInput(e.target.value)}
                                                        placeholder="Cuéntanos un poco sobre ti, qué lugares te gusta visitar, tus comidas favoritas..."
                                                        style={{ resize: 'none' }}
                                                    ></textarea>
                                                    <button onClick={handleSaveBio} className="btn btn-primary btn-sm me-2" style={{ backgroundColor: '#660000', borderColor: '#660000' }}>Guardar</button>
                                                    <button onClick={() => { setIsEditingBio(false); setBioInput(profileData?.bio || ''); }} className="btn btn-secondary btn-sm">Cancelar</button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p style={{ whiteSpace: 'pre-wrap', color: profileData?.bio ? '#333' : '#999', fontStyle: profileData?.bio ? 'normal' : 'italic', minHeight: '80px' }}>
                                                        {profileData?.bio || 'Aún no has escrito una biografía.'}
                                                    </p>
                                                    <button onClick={() => setIsEditingBio(true)} className="btn btn-outline-dark btn-sm mt-2">
                                                        <i className="fa fa-pencil"></i> {profileData?.bio ? 'Editar Biografía' : 'Añadir Biografía'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Pestaña: Favoritos */}
                                {activeTab === 'favorites' && (
                                    <div>
                                        <h4 className="border-bottom pb-2 mb-4">Mis Destinos Favoritos</h4>
                                        {favorites.length === 0 ? (
                                            <p className="text-muted text-center py-4">No tienes destinos guardados como favoritos.</p>
                                        ) : (
                                            <div className="row">
                                                {favorites.map(item => (
                                                    <div className="col-md-6 mb-4" key={item.id}>
                                                        <div className="card h-100">
                                                            <img src={item.image} className="card-img-top" alt={item.name} style={{ height: '150px', objectFit: 'cover' }} />
                                                            <div className="card-body">
                                                                <span className="badge" style={{ backgroundColor: '#660000', marginBottom: '10px' }}>{item.category}</span>
                                                                <h5 className="card-title">{item.name}</h5>
                                                            </div>
                                                            <div className="card-footer bg-white border-top-0 d-flex justify-content-between">
                                                                <button onClick={() => navigate(`/destination/${item.id}`)} className="btn btn-sm btn-outline-dark">Ver Destino</button>
                                                                <button onClick={() => removeFavorite(item.id)} className="btn btn-sm" style={{ color: '#660000' }}>
                                                                    <i className="fa fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pestaña: Reseñas */}
                                {activeTab === 'reviews' && (
                                    <div>
                                        <h4 className="border-bottom pb-2 mb-4">Reseñas Publicadas</h4>
                                        {loadingReviews ? (
                                            <p className="text-center py-4">Cargando tus reseñas...</p>
                                        ) : reviews.length === 0 ? (
                                            <p className="text-muted text-center py-4">No has escrito ninguna reseña todavía.</p>
                                        ) : (
                                            <div className="list-group">
                                                {reviews.map(review => (
                                                    <div key={review.id} className="list-group-item list-group-item-action flex-column align-items-start mb-2 rounded border">
                                                        <div className="d-flex w-100 justify-content-between">
                                                            <h5 className="mb-1" style={{ color: '#660000', cursor: 'pointer' }} onClick={() => navigate(`/destination/${review.destination_id}`)}>
                                                                {review.destination_name}
                                                            </h5>
                                                            <small className="text-muted">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                        <div className="mb-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <i
                                                                    key={star}
                                                                    className={`fa fa-star ${star <= review.rating ? 'text-warning' : 'text-secondary'}`}
                                                                ></i>
                                                            ))}
                                                        </div>
                                                        <p className="mb-2">{review.comment}</p>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteReview(review.id)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;
