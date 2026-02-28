import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';
import PageTransition from '../components/common/PageTransition';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { email });
            Swal.fire({
                title: 'Solicitud Enviada',
                text: response.data.message || 'Si el correo existe, recibirás un enlace.',
                icon: 'success',
                iconColor: '#660000',
                confirmButtonColor: '#660000'
            });
            setEmail('');
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Ocurrió un error al procesar la solicitud.',
                icon: 'error',
                iconColor: '#660000',
                confirmButtonColor: '#660000'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Recuperar Contraseña</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  <Link to="/login">Iniciar Sesión</Link> &gt; Recuperar</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h4 className="text-center mb-4">¿Olvidaste tu contraseña?</h4>
                                <p className="text-center text-muted mb-4">
                                    Ingresa tu correo electrónico y te enviaremos un enlace para que puedas crear una nueva contraseña.
                                </p>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label>Correo Electrónico</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="ejemplo@correo.com"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn w-100 btn-theme"
                                        style={{ backgroundColor: '#660000', borderColor: '#660000', color: 'white' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                                    </button>
                                </form>
                                <div className="mt-4 text-center">
                                    <Link to="/login" style={{ color: '#660000', textDecoration: 'none' }}>
                                        <i className="fa fa-arrow-left me-2"></i> Volver a Iniciar Sesión
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ForgotPassword;
