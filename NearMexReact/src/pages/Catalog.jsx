import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { destinations } from '../data/destinations';

const Catalog = () => {
    const [filterCategory, setFilterCategory] = useState('All');
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.category) {
            setFilterCategory(location.state.category);
        }
    }, [location.state]);

    const handleFilter = (category) => {
        setFilterCategory(category);
    };

    const filteredDestinations = destinations.filter(item => {
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

        return matchesCategory;
    });

    return (
        <>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Catálogo de Destinos</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  Catálogo</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section trending">
                <div className="container">

                    <div className="row mb-5" style={{ marginBottom: '40px' }}>
                    </div>

                    <ul className="trending-filter">
                        <li>
                            <a className={filterCategory === 'All' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('All')}>Todos</a>
                        </li>
                        <li>
                            <a className={filterCategory === 'Religioso' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Religioso')}>Religioso</a>
                        </li>
                        <li>
                            <a className={filterCategory === 'Museo' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Museo')}>Museos</a>
                        </li>
                        <li>
                            <a className={filterCategory === 'Teatro' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Teatro')}>Teatros</a>
                        </li>
                        <li>
                            <a className={filterCategory === 'Monumento' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Monumento')}>Monumentos</a>
                        </li>
                        <li>
                            <a className={filterCategory === 'Restaurante' ? 'is_active' : ''} href="#!" onClick={() => handleFilter('Restaurante')}>Restaurantes</a>
                        </li>
                    </ul>

                    <div className="row trending-box">
                        {filteredDestinations.length > 0 ? (
                            filteredDestinations.map((item) => (
                                <div className="col-lg-3 col-md-6 align-self-center mb-30 trending-items col-md-6" key={item.id}>
                                    <div className="item">
                                        <div className="thumb">
                                            <Link to={`/destination/${item.id}`}><img src={item.image} alt={item.name} /></Link>
                                        </div>
                                        <div className="down-content">
                                            <span className="category">{item.category}</span>
                                            <h4>{item.name}</h4>
                                            <Link to={`/destination/${item.id}`}><i className="fa fa-eye"></i></Link>
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
        </>
    );
};

export default Catalog;
