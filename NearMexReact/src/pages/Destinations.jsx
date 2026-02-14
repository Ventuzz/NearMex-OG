import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { destinations } from '../data/destinations';

const Destinations = () => {
    const { id } = useParams();
    const [destination, setDestination] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const found = destinations.find(d => d.id === id);
        setDestination(found);
        if (found) {
            setReviews(found.reviews || []);
        }
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));
    }, [id]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavorites;
        if (isFavorite) {
            newFavorites = favorites.filter(favId => favId !== id);
        } else {
            newFavorites = [...favorites, id];
        }
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

    if (!destination) {
        return (
            <div className="container" style={{ marginTop: '150px', textAlign: 'center' }}>
                <h2>Destino no encontrado</h2>
                <Link to="/catalog" className="btn btn-primary mt-3">Volver al Catálogo</Link>
            </div>
        );
    }

    const relatedDestinations = destinations
        .filter(d => d.id !== id)
        .slice(0, 4);

    return (
        <>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>{destination.name}</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  <Link to="/catalog">Catálogo</Link>  &gt;  {destination.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="single-product section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="left-image">
                                <img src={destination.image} alt={destination.name} />
                            </div>
                        </div>
                        <div className="col-lg-6 align-self-center">
                            <h4>{destination.fullName}</h4>
                            <p>{destination.description}</p>

                            <div className="main-button">
                                <button
                                    onClick={toggleFavorite}
                                    style={{
                                        backgroundColor: isFavorite ? '#ee626b' : '#000000',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 30px',
                                        borderRadius: '25px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        fontSize: '14px',
                                        transition: 'all .3s'
                                    }}
                                >
                                    <i className={`fa ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`}></i> {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
                                </button>
                            </div>

                            <ul className='mt-4'>
                                <li><span>ID Destino:</span> {destination.id}</li>
                                <li><span>Categoría:</span> <Link to="/catalog">{destination.category}</Link></li>
                                <li><span>Etiquetas:</span> {destination.tags.map((tag, i) => <React.Fragment key={i}><Link to="/catalog">{tag}</Link>{i < destination.tags.length - 1 ? ', ' : ''}</React.Fragment>)}</li>
                            </ul>
                        </div>
                        <div className="col-lg-12">
                            <div className="sep"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="more-info">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tabs-content">
                                <div className="row">
                                    <div className="nav-wrapper ">
                                        <ul className="nav nav-tabs" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab" aria-controls="description" aria-selected="true">Descripción</button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false">Reseñas ({reviews.length})</button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="tab-content" id="myTabContent">
                                        <div className="tab-pane fade show active" id="description" role="tabpanel" aria-labelledby="description-tab">
                                            <p>{destination.description}</p>
                                        </div>
                                        <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                                            {reviews.length > 0 ? (
                                                reviews.map((review, index) => (
                                                    <p key={index}><strong>{review.user}</strong>: {review.text}<br /><br /></p>
                                                ))
                                            ) : (
                                                <p>No hay reseñas aún.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section categories related-games">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="section-heading">
                                <h6>Turismo</h6>
                                <h2>También te puede interesar</h2>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="main-button">
                                <Link to="/catalog">Ver Todos</Link>
                            </div>
                        </div>
                        {relatedDestinations.map((item) => (
                            <div className="col-lg col-sm-6 col-xs-12" key={item.id}>
                                <div className="item">
                                    <h4>{item.category}</h4>
                                    <div className="thumb">
                                        <Link to={`/destination/${item.id}`}><img src={item.image} alt={item.name} /></Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Destinations;
