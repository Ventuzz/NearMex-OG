import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
    const [isSticky, setIsSticky] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

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

        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header className={`header-area header-sticky ${isSticky ? 'background-header' : ''}`}>
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
                                <li><a href="#">Iniciar Sesión</a></li>
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
