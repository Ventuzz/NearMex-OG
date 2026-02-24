import React, { useState, useContext } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';
import PageTransition from '../components/common/PageTransition';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


/**
 * Página de Inicio de Sesión.
 * Permite a los usuarios autenticarse para acceder a funciones protegidas.
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // Manejo del envío del formulario de login
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
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
                            <h3>Iniciar Sesión</h3>
                            <span className="breadcrumb"><Link to="/">Inicio</Link>  &gt;  Iniciar Sesión</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="text-center mb-4">Bienvenido de nuevo</h2>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <form onSubmit={handleSubmit}>
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
                                    <button type="submit" id="login-btn" className="btn w-100 btn-theme" style={{ backgroundColor: '#660000', borderColor: '#660000', color: 'white' }}>Entrar</button>
                                </form>
                                <div className="mt-3 text-center">
                                    <p>¿No tienes cuenta? <Link to="/register" style={{ color: '#660000', fontWeight: 'bold' }}>Regístrate aquí</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;
