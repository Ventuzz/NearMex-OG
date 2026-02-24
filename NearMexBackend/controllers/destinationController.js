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
