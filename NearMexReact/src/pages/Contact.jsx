import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
    return (
        <>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Sobre Nosotros</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  Sobre Nosotros</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="contact-page section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 offset-lg-2 text-center">
                            <div className="section-heading">
                                <h2>¿Tienes alguna pregunta?</h2>
                                <p style={{ fontSize: '18px' }}>Estamos aquí para ayudarte. Si tienes alguna consulta o necesitas más información sobre nuestros servicios, no dudes en contactarnos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="contact-page section">
                <div className="container">
                    <div className="row align-items-stretch">
                        <div className="col-lg-6 align-self-center mb-4 d-flex">
                            <div className="left-text" style={{ width: '100%', height: '100%' }}>
                                <div className="section-heading">
                                    <h6>Sobre Nosotros</h6>
                                    <h2>Nuestra Misión</h2>
                                </div>
                                <p style={{ fontSize: '18px' }}>Ser esa brújula local para cada visitante en nuestro país. No somos una agencia de viajes tradicional; somos el enlace entre tu lugar de estadía y los secretos mejor guardados de nuestros barrios.</p>
                            </div>
                        </div>

                        <div className="col-lg-6 align-self-center mb-4 d-flex">
                            <div className="left-text" style={{ width: '100%', height: '100%' }}>
                                <div className="section-heading">
                                    <h6>Sobre Nosotros</h6>
                                    <h2>Nuestra Visión</h2>
                                </div>
                                <p style={{ fontSize: '18px' }}>Consolidarnos como el ecosistema digital líder que convierte al espectador en un residente auténtico. Promovemos el crecimiento de las comunidades locales y compartimos la esencia de nuestra cultura.</p>
                            </div>
                        </div>

                    </div>
                    <div className="row" style={{ marginTop: '40px' }}>
                        <div className="col-lg-3">
                            <div className="info-item">
                                <h4>Dirección</h4>
                                <p>Av. Patria 1405, Zapopan, Jalisco, México</p>
                            </div>
                        </div>
                        <div className="col-lg-8 offset-lg-1">
                            <div className="right-content">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div id="map">
                                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7464.2857604705605!2d-103.41783488266589!3d20.704421825217313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428af0204c16149%3A0xf524dbd4b7be07df!2sAndares%20Corporativo%20Patria!5e0!3m2!1ses-419!2smx!4v1768551353333!5m2!1ses-419!2smx" width="100%" height="325px" frameBorder="0" style={{ border: 0, borderRadius: '23px' }} allowFullScreen=""></iframe>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="row" style={{ marginTop: '60px' }}>
                <div className="col-lg-12">
                    <div className="section-heading text-center" style={{ marginBottom: '40px' }}>
                        <h2>Nuestros Valores</h2>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="value-item text-center h-100 p-4" style={{ background: '#f7f7f7', borderRadius: '23px' }}>
                        <div className="icon" style={{ fontSize: '40px', color: '#8f030c', marginBottom: '20px' }}>
                            <i className="fa fa-heart"></i> </div>
                        <h4>Hospitalidad</h4>
                        <p>Reflejamos la calidez de México tratando a cada viajero como un invitado de honor, brindando un trato humano y acogedor en cada recomendación.</p>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="value-item text-center h-100 p-4" style={{ background: '#f7f7f7', borderRadius: '23px' }}>
                        <div className="icon" style={{ fontSize: '40px', color: '#8f030c', marginBottom: '20px' }}>
                            <i className="fa fa-shield"></i> </div>
                        <h4>Confianza</h4>
                        <p>Garantizamos seguridad y veracidad en nuestra información, permitiendo que el visitante explore ciudades desconocidas con total tranquilidad.</p>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="value-item text-center h-100 p-4" style={{ background: '#f7f7f7', borderRadius: '23px' }}>
                        <div className="icon" style={{ fontSize: '40px', color: '#8f030c', marginBottom: '20px' }}>
                            <i className="fa fa-handshake"></i> </div>
                        <h4>Integridad</h4>
                        <p>Mantenemos total transparencia en nuestras sugerencias, recomendando lugares por su excelencia real y protegiendo siempre los intereses del viajero.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;
