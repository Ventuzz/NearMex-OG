-- Create the database
CREATE DATABASE IF NOT EXISTS nearmex_db;
USE nearmex_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    bio TEXT DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(150),
    image VARCHAR(255),
    category VARCHAR(50),
    tags JSON,
    description TEXT,
    schedule VARCHAR(255),
    map_url TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination_id VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@nearmex.com', '$2b$12$75MdQwKoDmj/61S0y/ubuOCLOi/qq30YdQGRsuGMZU.P40JO5ixba', 'admin');

-- Insert inital destinations
INSERT IGNORE INTO destinations (id, name, full_name, image, category, tags, description, latitude, longitude) VALUES
('templo-expiatorio', 'Templo Expiatorio', 'Templo Expiatorio del Santísimo Sacramento', '/assets/images/destinations/templo-expiatorio.jpg', 'Religioso', '["Centro", "Historia", "Arquitectura"]', 'Una joya de la arquitectura neogótica en Guadalajara. Disfruta de una visita guiada por este impresionante templo, conoce su historia y admira sus vitrales únicos. Una experiencia imperdible para los amantes del arte y la historia.', 20.6725, -103.3552),
('catedral-guadalajara', 'Catedral de Guadalajara', 'Catedral Basílica de la Asunción de María Santísima', '/assets/images/destinations/catedral-guadalajara.jpg', 'Religioso', '["Centro", "Icono", "Turismo"]', 'La majestuosa catedral con sus icónicas torres neogóticas. El corazón de Guadalajara.', 20.6766, -103.3469),
('hospicio-cabanas', 'Hospicio Cabañas', 'Instituto Cultural Cabañas', '/assets/images/destinations/hospicio-cabanas.jpg', 'Museo', '["Patrimonio", "Arte", "Orozco"]', 'Patrimonio de la Humanidad por la UNESCO. Hogar de los murales de José Clemente Orozco.', 20.6767, -103.3375),
('teatro-degollado', 'Teatro Degollado', 'Teatro Degollado', '/assets/images/destinations/teatro-degollado.jpg', 'Teatro', '["Cultura", "Centro", "Música"]', 'Sede de la Orquesta Filarmónica de Jalisco. Un teatro de estilo neoclásico.', 20.6764, -103.3444),
('rotonda', 'Rotonda', 'Rotonda de los Jaliscienses Ilustres', '/assets/images/destinations/rotonda.jpg', 'Monumento', '["Historia", "Centro", "Homenaje"]', 'Monumento que rinde homenaje a los personajes más destacados de la historia de Jalisco.', 20.6775, -103.3463),
('arcos-vallarta', 'Arcos Vallarta', 'Arcos de Guadalajara', '/assets/images/destinations/arcos-vallarta.jpg', 'Monumento', '["Icono", "Vallarta", "Turismo"]', 'Antigua entrada a la ciudad, un monumento emblemático en la avenida Vallarta.', 20.6738, -103.3875),
('karne-garibaldi', 'Karne Garibaldi', 'Karne Garibaldi Santa Tere', '/assets/images/destinations/karne-garibaldi.png', 'Restaurante', '["Gastronomía", "Tradición", "Récord Guinness"]', 'Famoso por su "carne en su jugo" y por tener el servicio más rápido del mundo.', 20.6750, -103.3644),
('la-chata', 'La Chata', 'Cenaduría La Chata', '/assets/images/destinations/la-chata.jpg', 'Restaurante', '["Gastronomía", "Cena", "Tradición"]', 'Un lugar clásico para disfrutar de antojitos mexicanos y platillos tapatíos.', 20.6748, -103.3486);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, destination_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);
