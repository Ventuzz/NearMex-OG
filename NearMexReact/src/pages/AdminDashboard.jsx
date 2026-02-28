import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import api from '../services/api';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Obtener tab activa de la URL
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'destinations';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [previousTab, setPreviousTab] = useState(initialTab);

    // Estado de Destinos
    const [destinations, setDestinations] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(true);

    // Estado de Formulario de Destinos
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', full_name: '', description: '', image: '', category: 'Monumento',
        map_url: '', schedule: '', tags: '', latitude: '', longitude: ''
    });

    // Estado de Reseñas
    const [selectedDestination, setSelectedDestination] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        fetchDestinations();
    }, []);

    useEffect(() => {
        const currentTab = queryParams.get('tab') || 'destinations';
        if (currentTab !== activeTab) {
            setActiveTab(currentTab);
        }
    }, [location.search]);

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setPreviousTab(activeTab);
            navigate(`/admin?tab=${tab}`);
        }
    };

    const fetchDestinations = async () => {
        setLoadingDestinations(true);
        try {
            const response = await api.get('/destinations');
            setDestinations(response.data);
            if (response.data.length > 0 && !selectedDestination) {
                setSelectedDestination(response.data[0].id);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudieron cargar los destinos', 'error');
        } finally {
            setLoadingDestinations(false);
        }
    };

    const fetchReviewsByDestination = async (destId) => {
        if (!destId) return;
        setLoadingReviews(true);
        try {
            const response = await api.get(`/reviews/${destId}`);
            setReviews(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudieron cargar las reseñas', 'error');
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews' && selectedDestination) {
            fetchReviewsByDestination(selectedDestination);
        }
    }, [activeTab, selectedDestination]);

    // --- Manejo de Destinos ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateForm = () => {
        setFormData({
            name: '', full_name: '', description: '', image: '', category: 'Monumento',
            map_url: '', schedule: '', tags: '', latitude: '', longitude: ''
        });
        setEditingId(null);
        setShowForm(true);
    };

    const openEditForm = (dest) => {
        setFormData({
            ...dest,
            tags: Array.isArray(dest.tags) ? dest.tags.join(', ') : (dest.tags || '')
        });
        setEditingId(dest.id);
        setShowForm(true);
    };

    const saveDestination = async (e) => {
        e.preventDefault();
        try {
            // Extraer solo la URL si el usuario pega un iframe completo de Google Maps
            let cleanMapUrl = formData.map_url;
            if (cleanMapUrl && cleanMapUrl.includes('<iframe')) {
                const srcMatch = cleanMapUrl.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    cleanMapUrl = srcMatch[1];
                }
            }

            // Convertir tags string en array
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
            const payload = { ...formData, tags: tagsArray, map_url: cleanMapUrl };

            if (editingId) {
                await api.put(`/destinations/${editingId}`, payload);
                Swal.fire({ title: 'Actualizado', icon: 'success', iconColor: '#660000', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/destinations', payload);
                Swal.fire({ title: 'Creado', icon: 'success', iconColor: '#660000', timer: 1500, showConfirmButton: false });
            }
            setShowForm(false);
            fetchDestinations();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Ocurrió un error al guardar', 'error');
        }
    };

    const handleDeleteDestination = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Eliminarás el destino y todas sus reseñas!",
            icon: 'warning',
            iconColor: '#660000',
            showCancelButton: true,
            confirmButtonColor: '#660000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/destinations/${id}`);
                    setDestinations(destinations.filter(d => d.id !== id));
                    Swal.fire({ title: 'Eliminado', text: 'El destino ha sido eliminado.', icon: 'success', iconColor: '#660000', confirmButtonColor: '#660000' });
                } catch (e) {
                    console.error(e);
                    Swal.fire({ title: 'Error', text: 'No se pudo eliminar el destino', icon: 'error', iconColor: '#660000', confirmButtonColor: '#660000' });
                }
            }
        });
    };

    // --- Manejo de Reseñas ---

    const handleDeleteReview = (reviewId) => {
        Swal.fire({
            title: '¿Eliminar reseña?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            iconColor: '#660000',
            showCancelButton: true,
            confirmButtonColor: '#660000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/reviews/admin/${reviewId}`);
                    setReviews(reviews.filter(r => r.id !== reviewId));
                    Swal.fire({ title: 'Eliminada', text: 'La reseña ha sido eliminada.', icon: 'success', iconColor: '#660000', confirmButtonColor: '#660000' });
                } catch (e) {
                    console.error(e);
                    Swal.fire({ title: 'Error', text: 'No se pudo eliminar la reseña', icon: 'error', iconColor: '#660000', confirmButtonColor: '#660000' });
                }
            }
        });
    };


    const tabIndices = { 'destinations': 0, 'reviews': 1 };
    const direction = tabIndices[activeTab] - tabIndices[previousTab];

    const slideVariants = {
        enter: (direction) => ({
            y: direction > 0 ? 30 : -30,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            y: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            y: direction < 0 ? 30 : -30,
            opacity: 0
        })
    };

    return (
        <PageTransition>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Panel de Administración</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-5 mb-5" style={{ minHeight: '60vh' }}>
                <div className="row">
                    <div className="col-md-3 mb-4">
                        <div className="list-group">
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'destinations' ? 'active' : ''}`}
                                onClick={() => handleTabChange('destinations')}
                                style={activeTab === 'destinations' ? { backgroundColor: '#660000', borderColor: '#660000' } : {}}
                            >
                                <i className="fa fa-map-marker me-2"></i> Gestionar Destinos
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => handleTabChange('reviews')}
                                style={activeTab === 'reviews' ? { backgroundColor: '#660000', borderColor: '#660000' } : {}}
                            >
                                <i className="fa fa-comments me-2"></i> Moderar Reseñas
                            </button>
                        </div>
                    </div>

                    <div className="col-md-9" style={{ position: 'relative', overflow: 'hidden' }}>
                        <AnimatePresence mode="wait" custom={direction}>
                            {activeTab === 'destinations' && (
                                <motion.div
                                    key="destinations"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ y: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                    className="card shadow-sm w-100"
                                >
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h4>Catálogo de Destinos</h4>
                                            {!showForm && (
                                                <button className="btn btn-success" style={{ backgroundColor: '#660000', borderColor: '#660000' }} onClick={openCreateForm}>
                                                    <i className="fa fa-plus me-1"></i> Añadir Destino
                                                </button>
                                            )}
                                        </div>

                                        {showForm ? (
                                            <div>
                                                <h5>{editingId ? 'Editar Destino' : 'Nuevo Destino'}</h5>
                                                <form onSubmit={saveDestination}>
                                                    <div className="row">
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label">Nombre Corto</label>
                                                            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Nombre Completo</label>
                                                            <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Categoría</label>
                                                            <select className="form-control" name="category" value={formData.category} onChange={handleInputChange}>
                                                                <option value="Monumento">Monumento</option>
                                                                <option value="Museo">Museo</option>
                                                                <option value="Teatro">Teatro</option>
                                                                <option value="Religioso">Religioso</option>
                                                                <option value="Restaurante">Restaurante</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Horarios</label>
                                                            <input type="text" className="form-control" name="schedule" value={formData.schedule} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label">URL de Imagen</label>
                                                            <input type="text" className="form-control" name="image" value={formData.image} onChange={handleInputChange} required />
                                                        </div>
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label">Descripción</label>
                                                            <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="3" required></textarea>
                                                        </div>
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label">URL de Google Maps (Iframe Src)</label>
                                                            <input type="text" className="form-control" name="map_url" value={formData.map_url} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Latitud (Ej. 20.676667)</label>
                                                            <input type="number" step="any" className="form-control" name="latitude" value={formData.latitude} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Longitud (Ej. -103.3475)</label>
                                                            <input type="number" step="any" className="form-control" name="longitude" value={formData.longitude} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="col-md-12 mb-3">
                                                            <label className="form-label">Etiquetas (separadas por coma)</label>
                                                            <input type="text" className="form-control" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Playa, Familiar, Relajante" />
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                                                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#660000', borderColor: '#660000' }}>Guardar Destino</button>
                                                    </div>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Imagen</th>
                                                            <th>Nombre</th>
                                                            <th>Categoría</th>
                                                            <th className="text-end">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loadingDestinations ? (
                                                            <tr><td colSpan="4" className="text-center">Cargando destinos...</td></tr>
                                                        ) : destinations.map(dest => (
                                                            <tr key={dest.id}>
                                                                <td><img src={dest.image} alt={dest.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} /></td>
                                                                <td><strong>{dest.name}</strong><br /><small className="text-muted">{dest.id}</small></td>
                                                                <td>{dest.category}</td>
                                                                <td className="text-end">
                                                                    <button className="btn btn-sm me-2 w-auto" style={{ backgroundColor: '#fff', borderColor: '#660000', color: '#660000' }} onClick={() => openEditForm(dest)} title="Editar"><i className="fa fa-edit"></i></button>
                                                                    <button className="btn btn-sm w-auto" style={{ backgroundColor: '#660000', borderColor: '#660000', color: '#fff' }} onClick={() => handleDeleteDestination(dest.id)} title="Eliminar"><i className="fa fa-trash"></i></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <motion.div
                                    key="reviews"
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ y: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                    className="card shadow-sm w-100"
                                >
                                    <div className="card-body">
                                        <h4>Moderar Reseñas</h4>
                                        <p className="text-muted mb-4">Selecciona un destino para ver y moderar sus reseñas.</p>

                                        <div className="mb-4">
                                            <select
                                                className="form-select"
                                                value={selectedDestination}
                                                onChange={(e) => setSelectedDestination(e.target.value)}
                                            >
                                                <option value="" disabled>Seleccione un destino...</option>
                                                {destinations.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {!selectedDestination ? (
                                            <p className="text-center mt-4">Selecciona un destino para comenzar.</p>
                                        ) : loadingReviews ? (
                                            <p className="text-center mt-4">Cargando reseñas...</p>
                                        ) : reviews.length === 0 ? (
                                            <p className="text-center mt-4">No hay reseñas para este destino aún.</p>
                                        ) : (
                                            <div className="list-group">
                                                {reviews.map(review => (
                                                    <div key={review.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="d-flex w-100 justify-content-between mb-1">
                                                                <h6 className="mb-0"><strong>{review.username}</strong> <small className="text-muted ms-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</small></h6>
                                                                <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                                                            </div>
                                                            <p className="mb-1">{review.comment}</p>
                                                        </div>
                                                        <button className="btn btn-sm ms-3 w-auto" style={{ backgroundColor: '#660000', borderColor: '#660000', color: '#fff' }} onClick={() => handleDeleteReview(review.id)} title="Eliminar reseña">
                                                            <i className="fa fa-trash"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default AdminDashboard;
