import React, { useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

/**
 * Layout Principal de la aplicación.
 * El Header y Footer permanecen montados siempre; solo el contenido de la página (Outlet) anima.
 */
const MainLayout = () => {
    const location = useLocation();

    // Desplazar la vista hacia arriba en cada cambio de ruta
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <>
            <Header />
            <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
            </AnimatePresence>
            <Footer />
        </>
    );
};

export default MainLayout;
