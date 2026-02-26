import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import PageTransition from '../components/common/PageTransition';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Página del Catálogo de Destinos.
 * Muestra todos los destinos disponibles con funcionalidad de filtrado por categoría.
 */
const Catalog = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Mostrar Todo');

    // Efecto para obtener los destinos de la API
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await api.get('/destinations');
                setDestinations(response.data);
                setFilteredDestinations(response.data); // Inicializa los destinos filtrados con todos los destinos
            } catch (error) {
                console.error("Error fetching destinations:", error);
                Swal.fire('Error', 'No se pudieron cargar los destinos.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    // Efecto para aplicar el filtro si la categoría se recibe desde otra página
    useEffect(() => {
        if (location.state && location.state.category) {
            setActiveFilter(location.state.category);
        }
    }, [location.state]);

    // Efecto para aplicar filtros cada vez que destinations, activeFilter o searchQuery cambien
    useEffect(() => {
        let currentFiltered = destinations;

        // Aplicar filtro de categoría
        if (activeFilter !== 'Mostrar Todo') {
            currentFiltered = currentFiltered.filter(item => item.category === activeFilter);
        }

        // Aplicar filtro de búsqueda
        if (searchQuery) {
            const lowerCaseSearchQuery = searchQuery.toLowerCase();
            currentFiltered = currentFiltered.filter(item =>
                item.name.toLowerCase().includes(lowerCaseSearchQuery) ||
                item.category.toLowerCase().includes(lowerCaseSearchQuery) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchQuery)))
            );
        }

        setFilteredDestinations(currentFiltered);
    }, [destinations, activeFilter, searchQuery]);

    // Handler para cambiar la categoría del filtro
    const handleFilter = (category) => {
        setActiveFilter(category);
    };

    // Handler para hacer clic en un destino
    const handleDestinationClick = (id) => {
        navigate(`/destination/${id}`);
    };

    return (
        <PageTransition>
            <div className="page-heading header-text" style={{ paddingBottom: '30px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Catálogo de Destinos</h3>
                            <span className="breadcrumb">
                                {user?.role === 'admin' ? (
                                    <span style={{ color: '#fff', cursor: 'default' }}>Inicio</span>
                                ) : (
                                    <Link to="/">Inicio</Link>
                                )}  &gt;  Catálogo
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section trending" style={{ marginTop: '30px' }}>
                <div className="container">

                    <div className="row mb-5" style={{ marginTop: '0px', marginBottom: '40px' }}>
                        <div className="col-lg-12">
                            <div className="search-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar destinos, categorías o tipo de lugar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '15px 25px',
                                        borderRadius: '30px',
                                        border: '1px solid #e0e0e0',
                                        backgroundColor: '#f8f9fa',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Menú de filtros por categoría */}
                    <ul className="trending-filter">
                        <li>
                            <a className={activeFilter === 'Mostrar Todo' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Mostrar Todo')}>Mostrar Todo</a>
                        </li>
                        <li>
                            <a className={activeFilter === 'Religioso' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Religioso')}>Religioso</a>
                        </li>
                        <li>
                            <a className={activeFilter === 'Museo' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Museo')}>Museos</a>
                        </li>
                        <li>
                            <a className={activeFilter === 'Teatro' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Teatro')}>Teatros</a>
                        </li>
                        <li>
                            <a className={activeFilter === 'Monumento' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Monumento')}>Monumentos</a>
                        </li>
                        <li>
                            <a className={activeFilter === 'Restaurante' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Restaurante')}>Restaurantes</a>
                        </li>
                    </ul>

                    <div className="row trending-box">
                        {loading ? (
                            <div className="col-12 text-center" style={{ margin: '40px 0' }}>
                                <p>Cargando destinos...</p>
                            </div>
                        ) : filteredDestinations.length > 0 ? (
                            <AnimatePresence>
                                {filteredDestinations.map((item, index) => (
                                    <motion.div
                                        className="col-lg-3 col-md-6 align-self-center mb-4"
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <div
                                            className="item"
                                            onClick={() => handleDestinationClick(item.id)}
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
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="col-lg-12">
                                <p className="text-center">No se encontraron destinos que coincidan con tu búsqueda.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </PageTransition>
    );
};

export default Catalog;
