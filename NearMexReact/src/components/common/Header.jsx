import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * Componente de Encabezado (Header).
 * Muestra la barra de navegación, el logo y gestiona el estado de sesión del usuario.
 */
const Header = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Alternar visibilidad del menú en móviles
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Manejar cierre de sesión
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

    return (
        <header className={`header-area header-sticky ${isSticky ? 'background-header' : ''}`}>
            {/* ... Contenido del header ... */}
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="main-nav">
                            {/* Logo Start */}
                            <Link to="/" className="logo">
                                <img src="/assets/images/logo.png" alt="" style={{ width: '200px' }} />
                            </Link>
                            {/* Logo End */}
                            {/* Menu Start */}
                            <ul className={`nav ${isMenuOpen ? 'active' : ''}`} style={{ display: isMenuOpen ? 'block' : undefined }}>
                                <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Inicio</NavLink></li>
                                <li><NavLink to="/catalog" className={({ isActive }) => isActive ? "active" : ""}>Destinos</NavLink></li>
                                <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>Sobre Nosotros</NavLink></li>
                                {user ? (
                                    <>
                                        <li>
                                            <a href="#!" style={{ display: 'flex', alignItems: 'center' }}>
                                                <i className="fa fa-user-circle" style={{ fontSize: '20px', marginRight: '8px' }}></i>
                                                {user.username}
                                            </a>
                                        </li>
                                        <li><a href="#!" onClick={handleLogout} className="logout-button">Cerrar Sesión</a></li>
                                    </>
                                ) : (
                                    <li><NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Iniciar Sesión</NavLink></li>
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
    );
};

export default Header;

