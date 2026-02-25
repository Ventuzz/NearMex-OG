const db = require('../config/db');

/**
 * Obtiene la lista de destinos desde la base de datos.
 */
exports.getDestinations = async (req, res) => {
    try {
        const [destinations] = await db.execute('SELECT * FROM destinations');

        // Formatear los tags de vuelta a Array si es necesario (el driver MySQL puede devolverlos como string)
        const formattedDestinations = destinations.map(dest => {
            return {
                ...dest,
                tags: typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags
            };
        });

        res.json(formattedDestinations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener destinos' });
    }
};

/**
 * Obtiene un destino específico por ID.
 */
exports.getDestinationById = async (req, res) => {
    const { id } = req.params;
    try {
        const [destinations] = await db.execute('SELECT * FROM destinations WHERE id = ?', [id]);

        if (destinations.length === 0) {
            return res.status(404).json({ message: 'Destino no encontrado' });
        }

        const dest = destinations[0];
        const formattedDestination = {
            ...dest,
            tags: typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags
        };

        res.json(formattedDestination);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el destino' });
    }
};

/**
 * Crea un nuevo destino (Solo Admin)
 */
exports.createDestination = async (req, res) => {
    const { id, name, full_name, description, image, category, map_url, schedule, tags, latitude, longitude } = req.body;
    try {
        const tagsString = Array.isArray(tags) ? JSON.stringify(tags) : tags;

        await db.execute(
            'INSERT INTO destinations (id, name, full_name, description, image, category, map_url, schedule, tags, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id || name.toLowerCase().replace(/\s+/g, '-'), name, full_name || '', description, image, category, map_url || '', schedule || '', tagsString || '[]', latitude || null, longitude || null]
        );
        res.status(201).json({ message: 'Destino creado exitosamente' });
    } catch (error) {
        console.error("Error al crear destino:", error);
        res.status(500).json({ message: 'Error al crear el destino' });
    }
};

/**
 * Actualiza un destino existente (Solo Admin)
 */
exports.updateDestination = async (req, res) => {
    const { id } = req.params;
    const { name, full_name, description, image, category, map_url, schedule, tags, latitude, longitude } = req.body;
    try {
        const tagsString = Array.isArray(tags) ? JSON.stringify(tags) : tags;

        await db.execute(
            'UPDATE destinations SET name=?, full_name=?, description=?, image=?, category=?, map_url=?, schedule=?, tags=?, latitude=?, longitude=? WHERE id=?',
            [name, full_name || '', description, image, category, map_url || '', schedule || '', tagsString, latitude || null, longitude || null, id]
        );
        res.json({ message: 'Destino actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar destino:", error);
        res.status(500).json({ message: 'Error al actualizar el destino' });
    }
};

/**
 * Elimina un destino (Solo Admin)
 */
exports.deleteDestination = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM destinations WHERE id = ?', [id]);
        res.json({ message: 'Destino eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar destino:", error);
        res.status(500).json({ message: 'Error al eliminar el destino' });
    }
};
