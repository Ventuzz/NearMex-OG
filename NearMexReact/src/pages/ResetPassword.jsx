import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';
import PageTransition from '../components/common/PageTransition';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Obtener el token de la URL: ?token=abc123xyz
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            Swal.fire({
                title: 'Error',
                text: 'No se encontró un token válido en la URL.',
                icon: 'error',
                iconColor: '#660000',
                confirmButtonColor: '#660000'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                title: 'Error',
                text: 'Las contraseñas no coinciden.',
                icon: 'error',
                iconColor: '#660000',
                confirmButtonColor: '#660000'
            });
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire({
                title: 'Atención',
                text: 'La contraseña debe tener al menos 6 caracteres.',
                icon: 'warning',
                iconColor: '#660000',
                confirmButtonColor: '#660000'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            Swal.fire({
                title: '¡Éxito!',
                text: response.data.message || 'Contraseña actualizada correctamente.',
                icon: 'success',
                iconColor: '#660000',
                confirmButtonColor: '#660000'
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'El enlace es inválido o expiró.',
                icon: 'error',
                iconColor: '#660000',
                confirmButtonColor: '#660000'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="container mt-5 text-center" style={{ minHeight: '50vh' }}>
                <h3 className="mt-5 text-danger">Enlace inválido</h3>
                <p>No se proporcionó un token de seguridad válido para restablecer la contraseña.</p>
                <Link to="/login" className="btn mt-3" style={{ backgroundColor: '#660000', color: 'white' }}>Ir a Inicio de Sesión</Link>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Nueva Contraseña</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h4 className="text-center mb-4">Crea tu nueva contraseña</h4>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label>Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength="6"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label>Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength="6"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn w-100 btn-theme"
                                        style={{ backgroundColor: '#660000', borderColor: '#660000', color: 'white' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ResetPassword;
