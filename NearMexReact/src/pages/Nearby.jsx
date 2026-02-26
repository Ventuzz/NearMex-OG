import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import { AuthContext } from '../context/AuthContext';

// Función de Haversine para calcular distancia en kilómetros
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Limites geográficos aproximados de la ZMG (Guadalajara, Zapopan, Tlaquepaque, Tonalá, Tlajomulco)
// Left,Top,Right,Bottom -> West,North,East,South
const GDL_VIEWBOX = "-103.55,20.85,-103.15,20.40";

const Nearby = () => {
    const { user } = useContext(AuthContext);
    const [originalDestinations, setOriginalDestinations] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLoc, setUserLoc] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [locationSource, setLocationSource] = useState("");

    const [manualAddress, setManualAddress] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // 1. Conseguir destinos de la API
        const fetchDestinations = async () => {
            try {
                const response = await api.get('/destinations');
                setOriginalDestinations(response.data);
                return response.data; // Aún sin ordenar
            } catch (error) {
                console.error("Error fetching destinations:", error);
                setErrorMsg("No se pudieron cargar los destinos.");
                setLoading(false);
                return [];
            }
        };

        const tryGetCoordinates = async (addressText) => {
            try {
                // Limit search to Guadalajara via viewbox
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&viewbox=${GDL_VIEWBOX}&bounded=1&limit=1`);
                const data = await response.json();
                if (data && data.length > 0) {
                    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                }
            } catch (error) {
                console.error("Nominatim error via Profile Address:", error);
            }
            return null;
        };

        // 2. Jerarquía de Ubicación
        const initializeLocation = async () => {
            const dests = await fetchDestinations();
            if (dests.length === 0) return;

            // Prioridad 1: Dirección del Perfil
            if (user && user.address) {
                const coords = await tryGetCoordinates(user.address);
                if (coords) {
                    setLocationSource('tu perfil');
                    applyCoordinates(coords.lat, coords.lon, dests);
                    return;
                } else {
                    console.log("No pudimos convertir la dirección del perfil a coordenadas.");
                }
            }

            // Prioridad 2: GPS Navegador (Fallback)
            if (!navigator.geolocation) {
                setErrorMsg("Tu navegador no soporta geolocalización y no tienes dirección guardada. Ingresa tu ubicación manualmente.");
                setDestinations(dests);
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationSource('GPS');
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    applyCoordinates(userLat, userLon, dests);
                },
                (error) => {
                    console.error("Geo error:", error);
                    setErrorMsg("No diste permiso de GPS y no tienes dirección de perfil. Ingresa tu dirección manualmente en el buscador.");
                    setDestinations(dests);
                    setLoading(false);
                },
                { timeout: 10000 }
            );
        };

        initializeLocation();
        window.scrollTo(0, 0);
    }, [user]);

    const applyCoordinates = (lat, lon, baseList = originalDestinations) => {
        setUserLoc({ lat, lng: lon });
        const destinationsWithDistance = baseList.map(dest => {
            if (!dest.latitude || !dest.longitude) return { ...dest, distance: Infinity };
            const dist = calculateDistance(lat, lon, parseFloat(dest.latitude), parseFloat(dest.longitude));
            return { ...dest, distance: dist };
        });

        destinationsWithDistance.sort((a, b) => a.distance - b.distance);
        setDestinations(destinationsWithDistance);
        setLoading(false);
        setErrorMsg(""); // Clear errors on success
    };

    const handleAddressChange = (e) => {
        setManualAddress(e.target.value);
    };

    const handleManualSearchBtn = async () => {
        if (!manualAddress.trim()) {
            Swal.fire({ title: 'Aviso', text: 'Escribe una dirección primero', icon: 'warning', confirmButtonColor: '#660000' });
            return;
        }

        setIsSearching(true);
        setErrorMsg("");

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&viewbox=${GDL_VIEWBOX}&bounded=1&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                setLocationSource("la dirección ingresada");
                applyCoordinates(parseFloat(data[0].lat), parseFloat(data[0].lon));
            } else {
                Swal.fire({ title: 'Error', text: 'No pudimos localizar la dirección en el área de Guadalajara. Sé más específico, ej. "Arcos Vallarta".', icon: 'error', confirmButtonColor: '#660000' });
            }
        } catch (error) {
            console.error("Error Geocoding:", error);
            Swal.fire({ title: 'Error', text: 'Hubo un problema al buscar la dirección en el servidor.', icon: 'error', confirmButtonColor: '#660000' });
        }
        setIsSearching(false);
    };

    return (
        <PageTransition>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Cerca de Mí</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  Cerca de Mí</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="search-form" style={{ backgroundColor: '#f8f9fa', padding: '40px 0', borderBottom: '1px solid #eee' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', position: 'relative' }}>
                                <div className="card-body p-4">
                                    <h5 className="mb-3" style={{ fontWeight: '600', color: '#1a1a1a' }}>📍 ¿No encuentras tu dirección? Buscala manualmente:</h5>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="Ej. Arcos Vallarta, Zapopan..."
                                            value={manualAddress}
                                            onChange={handleAddressChange}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleManualSearchBtn();
                                                }
                                            }}
                                            disabled={isSearching}
                                            style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', fontSize: '16px' }}
                                        />
                                        <div className="input-group-append">
                                            <button
                                                className="btn btn-primary btn-lg"
                                                type="button"
                                                onClick={handleManualSearchBtn}
                                                disabled={isSearching}
                                                style={{ backgroundColor: '#660000', borderColor: '#660000', borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}
                                            >
                                                {isSearching ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-search"></i>} Buscar
                                            </button>
                                        </div>
                                    </div>

                                    {errorMsg && (
                                        <div className="alert alert-warning mt-3 mb-0">
                                            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                                            {errorMsg}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="amazing-deals" style={{ padding: '60px 0', backgroundColor: '#fff' }}>
                <div className="container">

                    {loading ? (
                        <div className="text-center" style={{ padding: '100px 0' }}>
                            <div className="spinner-border" role="status" style={{ color: '#660000', width: '4rem', height: '4rem' }}>
                                <span className="sr-only">Buscando...</span>
                            </div>
                            <h4 className="mt-4" style={{ color: '#666' }}>Buscando con {user?.address ? 'tu perfil' : 'GPS'}...</h4>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-12 text-center mb-5">
                                {locationSource && (
                                    <p style={{ color: '#666', fontStyle: 'italic', fontSize: '15px' }}>
                                        Mostrando resultados basados en <strong>{locationSource}</strong>.
                                    </p>
                                )}
                            </div>
                            {destinations.map((item, index) => (
                                <div className="col-lg-6 col-sm-6" key={item.id || index}>
                                    <motion.div
                                        className="item"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        onClick={() => navigate(`/destination/${item.id}`)}
                                        style={{
                                            position: 'relative',
                                            marginBottom: '30px',
                                            borderRadius: '15px',
                                            overflow: 'hidden',
                                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div className="image" style={{ position: 'relative', height: '300px' }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {/* Badge de Distancia */}
                                            {item.distance && item.distance !== Infinity && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '15px',
                                                    right: '15px',
                                                    backgroundColor: '#660000',
                                                    color: 'white',
                                                    padding: '8px 15px',
                                                    borderRadius: '25px',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                                                    zIndex: 2,
                                                    fontSize: '15px'
                                                }}>
                                                    <i className="fa fa-location-arrow" style={{ marginRight: '5px' }}></i>
                                                    {item.distance < 1
                                                        ? `${Math.round(item.distance * 1000)} m`
                                                        : `${item.distance.toFixed(1)} km`}
                                                </div>
                                            )}
                                        </div>
                                        <div className="content" style={{ padding: '25px', backgroundColor: '#fff' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <span className="category" style={{
                                                    color: '#660000',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}>{item.category}</span>
                                            </div>
                                            <h4 style={{
                                                fontSize: '22px',
                                                fontWeight: '700',
                                                marginBottom: '15px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                color: '#1a1a1a'
                                            }}>{item.name}</h4>
                                            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="main-button">
                                                    <span style={{
                                                        backgroundColor: '#660000',
                                                        color: '#fff',
                                                        padding: '10px 20px',
                                                        borderRadius: '25px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: '500',
                                                        transition: 'all 0.3s'
                                                    }}>Explorar <i className="fa fa-arrow-right" style={{ marginLeft: '8px' }}></i></span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}

                            {destinations.length === 0 && !loading && (
                                <div className="col-12 text-center" style={{ padding: '50px 0' }}>
                                    <h3>No se encontraron lugares turísticos.</h3>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Nearby;
