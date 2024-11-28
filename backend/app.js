const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const path = require('path');

require('dotenv').config();
const URL_MONGO_DB = process.env.URL_MONGO_DB

const app = express();

// Middleware pour traiter les requêtes avec un corps JSON ou encodé
app.use(express.json()); // Pour les requêtes au format JSON
app.use(express.urlencoded({ extended: true })); // Pour les données encodées dans l'URL

mongoose.connect(URL_MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware pour configurer les headers CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
