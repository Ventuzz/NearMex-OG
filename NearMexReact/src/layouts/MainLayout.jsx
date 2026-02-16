import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Outlet } from 'react-router-dom';

/**
 * Layout Principal de la aplicación.
 * Define la estructura común para todas las páginas, incluyendo Header, Footer y el contenido de la página
 */
const MainLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
};

export default MainLayout;
