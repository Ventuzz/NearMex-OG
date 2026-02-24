-- Create the database
CREATE DATABASE IF NOT EXISTS nearmex_db;
USE nearmex_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
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

-- Insert inital destinations
INSERT IGNORE INTO destinations (id, name, full_name, image, category, tags, description) VALUES
('templo-expiatorio', 'Templo Expiatorio', 'Templo Expiatorio del Santísimo Sacramento', '/assets/images/destinations/templo-expiatorio.jpg', 'Religioso', '["Centro", "Historia", "Arquitectura"]', 'Una joya de la arquitectura neogótica en Guadalajara. Disfruta de una visita guiada por este impresionante templo, conoce su historia y admira sus vitrales únicos. Una experiencia imperdible para los amantes del arte y la historia.'),
('catedral-guadalajara', 'Catedral de Guadalajara', 'Catedral Basílica de la Asunción de María Santísima', '/assets/images/destinations/catedral-guadalajara.jpg', 'Religioso', '["Centro", "Icono", "Turismo"]', 'La majestuosa catedral con sus icónicas torres neogóticas. El corazón de Guadalajara.'),
('hospicio-cabanas', 'Hospicio Cabañas', 'Instituto Cultural Cabañas', '/assets/images/destinations/hospicio-cabanas.jpg', 'Museo', '["Patrimonio", "Arte", "Orozco"]', 'Patrimonio de la Humanidad por la UNESCO. Hogar de los murales de José Clemente Orozco.'),
('teatro-degollado', 'Teatro Degollado', 'Teatro Degollado', '/assets/images/destinations/teatro-degollado.jpg', 'Teatro', '["Cultura", "Centro", "Música"]', 'Sede de la Orquesta Filarmónica de Jalisco. Un teatro de estilo neoclásico.'),
('rotonda', 'Rotonda', 'Rotonda de los Jaliscienses Ilustres', '/assets/images/destinations/rotonda.jpg', 'Monumento', '["Historia", "Centro", "Homenaje"]', 'Monumento que rinde homenaje a los personajes más destacados de la historia de Jalisco.'),
('arcos-vallarta', 'Arcos Vallarta', 'Arcos de Guadalajara', '/assets/images/destinations/arcos-vallarta.jpg', 'Monumento', '["Icono", "Vallarta", "Turismo"]', 'Antigua entrada a la ciudad, un monumento emblemático en la avenida Vallarta.'),
('karne-garibaldi', 'Karne Garibaldi', 'Karne Garibaldi Santa Tere', '/assets/images/destinations/karne-garibaldi.png', 'Restaurante', '["Gastronomía", "Tradición", "Récord Guinness"]', 'Famoso por su "carne en su jugo" y por tener el servicio más rápido del mundo.'),
('la-chata', 'La Chata', 'Cenaduría La Chata', '/assets/images/destinations/la-chata.jpg', 'Restaurante', '["Gastronomía", "Cena", "Tradición"]', 'Un lugar clásico para disfrutar de antojitos mexicanos y platillos tapatíos.');

