
/**
 * Controlador de Destinos. aun no hace la consulta a la base de datos porque no se a migrado la base de datos
 */

const destinationsData = [
    {
        id: 'templo-expiatorio',
        name: 'Templo Expiatorio',
    }
];

/**
 * Obtiene la lista de destinos.
 */
exports.getDestinations = (req, res) => {
    res.json({ message: 'El endpoint de destinos está funcionando' });
};
