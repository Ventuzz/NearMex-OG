const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('NearMex Backend is running!');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
