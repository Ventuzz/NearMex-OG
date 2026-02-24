import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageTransition from '../components/common/PageTransition';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

/**
 * Página del Catálogo de Destinos.
 * Muestra todos los destinos disponibles con funcionalidad de filtrado por categoría.
 */
const Catalog = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Mostrar Todo');

    // Effect to fetch destinations from API
    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await api.get('/destinations');
                setDestinations(response.data);
                setFilteredDestinations(response.data); // Initialize filtered destinations with all destinations
            } catch (error) {
                console.error("Error fetching destinations:", error);
                Swal.fire('Error', 'No se pudieron cargar los destinos.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    // Effect to apply filter if category is received from another page
    useEffect(() => {
        if (location.state && location.state.category) {
            setActiveFilter(location.state.category);
        }
    }, [location.state]);

    // Effect to apply filters whenever destinations, activeFilter, or searchQuery changes
    useEffect(() => {
        let currentFiltered = destinations;

        // Apply category filter
        if (activeFilter !== 'Mostrar Todo') {
            currentFiltered = currentFiltered.filter(item => item.category === activeFilter);
        }

        // Apply search query filter
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

    // Handler to change the filter category
    const handleFilter = (category) => {
        setActiveFilter(category);
    };

    // Handler for destination click (if needed, otherwise can be removed)
    const handleDestinationClick = (e, id) => {
        // Optional: Add any specific logic for when a destination link is clicked
        // e.preventDefault(); // Uncomment to prevent default navigation
        // console.log(`Navigating to destination with ID: ${id}`);
    };

    return (
        <PageTransition>
            <div className="page-heading header-text" style={{ paddingBottom: '30px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Catálogo de Destinos</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  Catálogo</span>
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
                                    placeholder="Buscar por nombre, categoría o etiqueta..."
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
                            <a className={activeFilter === 'Mostrar Todo' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Mostrar Todo')}>Todos</a>
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
                                <p>Cargando catálogo de destinos...</p>
                            </div>
                        ) : filteredDestinations.length > 0 ? (
                            filteredDestinations.map(item => (
                                <div className="col-lg-3 col-md-6 align-self-center mb-4" key={item.id}>
                                    <div className="item">
                                        <div className="thumb">
                                            <Link to={`/destination/${item.id}`} onClick={(e) => handleDestinationClick(e, item.id)}>
                                                <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '15px' }} />
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
