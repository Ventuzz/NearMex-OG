import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * Componente de Encabezado (Header).
 * Muestra la barra de navegación, el logo y gestiona el estado de sesión del usuario.
 */
const Header = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const headerRef = React.useRef(null);

    // Alternar visibilidad del menú en móviles
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Manejar cierre de sesión
    const handleLogout = () => {
        navigate('/login');
        // Limpiamos el estado en el siguiente tick del event loop
        setTimeout(() => {
            logout();
        }, 300);
    };

    // Alternar visibilidad del dropdown del usuario
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const closeMenus = () => {
        setIsDropdownOpen(false);
        setIsMenuOpen(false);
    };

    // Cerrar el menú móvil al cambiar de ruta
    useEffect(() => {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    }, [location.pathname]);

    // Cerrar el menú móvil al hacer clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setIsMenuOpen(false);
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Efecto para detectar scroll y cambiar estilo del header
    useEffect(() => {
        const handleScroll = () => {
            const scroll = window.scrollY;
            const headerTextElement = document.querySelector('.header-text');
            const threshold = headerTextElement ? (headerTextElement.offsetHeight - 80) : 150;

            if (scroll >= threshold) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Comprobación inicial
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Cerrar menú móvil al redimensionar a pantalla de escritorio
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 991 && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isMenuOpen]);

    return (
        <>
            <style>
                {`
            .profile-dropdown-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background-color: #1a1a1a;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5);
                z-index: 1000;
                list-style: none;
                padding: 10px 0 !important;
                margin: 0;
                min-width: 220px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
            }
            .header-area .main-nav .nav li .profile-dropdown-menu li {
                padding: 0;
                margin: 0;
                display: block;
                width: 100%;
                height: auto;
            }
            .header-area .main-nav .nav li .profile-dropdown-menu li a {
                color: #ffffff !important;
                padding: 12px 20px !important;
                display: flex !important;
                align-items: center !important;
                text-transform: none !important;
                font-weight: 500 !important;
                font-size: 15px !important;
                line-height: normal !important;
                height: auto !important;
                background-color: transparent !important;
                border-radius: 0 !important;
                width: 100% !important;
                transition: background-color 0.2s !important;
            }
            .header-area .main-nav .nav li .profile-dropdown-menu li a:hover {
                background-color: #333333 !important;
                color: #ffffff !important;
            }
            .profile-dropdown-menu li a i {
                width: 25px;
                color: #ffffff;
                font-size: 18px;
                margin-right: 12px;
                text-align: center;
            }
            
            @media (max-width: 991px) {
                .profile-menu-item {
                    height: auto !important;
                }
                .profile-dropdown-menu {
                    position: static !important;
                    background-color: #1a1a1a !important;
                    padding: 10px 0 !important;
                    width: calc(100% - 40px) !important;
                    margin: 10px auto 20px auto !important;
                    border-radius: 8px !important;
                    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5) !important;
                }
                .header-area .main-nav .nav li .profile-dropdown-menu li {
                    height: auto !important;
                    background-color: transparent !important;
                    border-radius: 0 !important;
                    border: none !important;
                }
                .header-area .main-nav .nav li > a[href="#!"] {
                    justify-content: center !important;
                }
                .header-area .main-nav .nav li .profile-dropdown-menu li a {
                    justify-content: flex-start !important;
                    background-color: transparent !important;
                    height: auto !important;
                    line-height: normal !important;
                    border-radius: 0 !important;
                    color: #ffffff !important;
                    padding: 12px 20px !important;
                }
                .header-area .main-nav .nav li .profile-dropdown-menu li a:hover {
                    background-color: #333333 !important;
                    color: #ffffff !important;
                }
                .profile-dropdown-menu li a i {
                    color: #ffffff !important;
                }
                /* Admin link specific background reset */
                .header-area .main-nav .nav li .profile-dropdown-menu li[style*="background-color: #660000"] a {
                    background-color: transparent !important;
                }

                /* Reseting main mobile navigation to dark theme */
                .background-header .main-nav .nav,
                .header-area .main-nav .nav {
                    background-color: #1a1a1a !important;
                    border-radius: 0 0 15px 15px !important;
                    padding-bottom: 10px !important;
                }
                .background-header .main-nav .nav li,
                .header-area .main-nav .nav li {
                    background-color: transparent !important;
                    border-top: 1px solid #333 !important;
                    height: auto !important;
                    border-radius: 0 !important;
                }
                .header-area .main-nav .nav li:first-child {
                    border-top: none !important;
                }
                .background-header .main-nav .nav li a,
                .header-area .main-nav .nav li a {
                    background-color: transparent !important;
                    color: #fff !important;
                    height: auto !important;
                    line-height: normal !important;
                    padding: 15px 20px !important;
                    border-radius: 0 !important;
                }
                .background-header .main-nav .nav li a:hover,
                .header-area .main-nav .nav li a:hover,
                .header-area.header-sticky .nav li a.active,
                .header-area .main-nav .nav li a.active {
                    color: #fff !important;
                    background-color: rgba(255, 255, 255, 0.10) !important;
                }
            }
        `}
            </style>
            <header ref={headerRef} className={`header-area header-sticky ${isSticky ? 'background-header' : ''}`}>
                {/* ... Contenido del header ... */}
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <nav className="main-nav">
                                {/* Logo Start */}
                                <Link
                                    to={user?.role === 'admin' ? '#' : '/'}
                                    className="logo"
                                    onClick={(e) => user?.role === 'admin' && e.preventDefault()}
                                    style={{ cursor: user?.role === 'admin' ? 'default' : 'pointer' }}
                                >
                                    <img src="/assets/images/logo.png" alt="Logo" style={{ width: '200px' }} />
                                </Link>
                                {/* Logo End */}
                                {/* Menu Start */}
                                <ul className={`nav ${isMenuOpen ? 'active' : ''}`} style={{ display: isMenuOpen ? 'block' : undefined }}>
                                    {user?.role !== 'admin' && (
                                        <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} style={{ fontSize: '18px' }}>Inicio</NavLink></li>
                                    )}
                                    {user && (
                                        <li><NavLink to="/catalog" className={({ isActive }) => isActive ? "active" : ""} style={{ fontSize: '18px' }}>Catálogo</NavLink></li>
                                    )}
                                    {user?.role !== 'admin' && user && (
                                        <li><NavLink to="/nearby" className={({ isActive }) => isActive ? "active" : ""} style={{ fontSize: '18px' }}>Cerca de Mí</NavLink></li>
                                    )}
                                    {user?.role !== 'admin' && (
                                        <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""} style={{ fontSize: '18px' }}>Contacto</NavLink></li>
                                    )}
                                    {user ? (
                                        <>
                                            <li className="profile-menu-item" style={{ position: 'relative' }}>
                                                <a
                                                    href="#!"
                                                    onClick={toggleDropdown}
                                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                >
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.username} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px' }} />
                                                    ) : (
                                                        <i className="fa fa-user-circle" style={{ fontSize: '20px', marginRight: '8px' }}></i>
                                                    )}
                                                    {user.username}
                                                    <i className={`fa fa-chevron-${isDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '12px', marginLeft: '6px' }}></i>
                                                </a>

                                                {/* Dropdown Menu */}
                                                {isDropdownOpen && (
                                                    <ul className="profile-dropdown-menu">
                                                        {user.role === 'admin' && (
                                                            <li style={{ backgroundColor: '#660000', marginBottom: '5px', borderRadius: '5px' }}>
                                                                <Link to="/admin" onClick={closeMenus} style={{ color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                                                    <i className="fa fa-cogs" style={{ color: '#ffffff', marginRight: '8px' }}></i> Panel Admin
                                                                </Link>
                                                            </li>
                                                        )}
                                                        <li>
                                                            <Link to="/profile?tab=info" onClick={closeMenus}>
                                                                <i className="fa fa-info-circle"></i> Información del Perfil
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link to="/profile?tab=favorites" onClick={closeMenus}>
                                                                <i className="fa fa-heart"></i> Mis Favoritos
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link to="/profile?tab=reviews" onClick={closeMenus}>
                                                                <i className="fa fa-star"></i> Mis Reseñas
                                                            </Link>
                                                        </li>
                                                        <li style={{ borderTop: '1px solid #333', marginTop: '5px', paddingTop: '5px' }}>
                                                            <a href="#!" onClick={() => { handleLogout(); closeMenus(); }}>
                                                                <i className="fa fa-sign-out"></i> Cerrar Sesión
                                                            </a>
                                                        </li>
                                                    </ul>
                                                )}
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li><NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""} style={{ fontSize: '18px', fontWeight: '500' }}>Iniciar Sesión</NavLink></li>
                                        </>
                                    )}
                                </ul>
                                <a className={`menu-trigger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                                    <span>Menu</span>
                                </a>
                                {/*  Menu End */}
                            </nav>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;

