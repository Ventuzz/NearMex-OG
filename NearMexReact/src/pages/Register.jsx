import React, { useState, useContext } from 'react';
import PageTransition from '../components/common/PageTransition';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Página de Registro de Usuarios.
 * Permite crear una nueva cuenta en la plataforma.
 */
const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Manejo del envío del formulario de registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(username, email, password);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <PageTransition>
            <div className="page-heading header-text">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h3>Registro</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  Registro</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="text-center mb-4">Crear Cuenta</h2>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label>Nombre de Usuario</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label>Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn w-100 btn-theme">Registrarse</button>
                                </form>
                                <div className="mt-3 text-center">
                                    <p>¿Ya tienes cuenta? <Link to="/login" style={{ color: '#660000', fontWeight: 'bold' }}>Inicia sesión aquí</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Register;
