const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const { upload, optimizeImage } = require('../middleware/multer-sharp-config');

// Route POST pour l'ajout d'un livre
router.post('/:id/rating', auth, bookCtrl.ratingBook);
router.post('/', auth, upload, optimizeImage, bookCtrl.addBook);

// Route GET pour les livres
router.get('/bestrating', bookCtrl.bestrating); // Route spécifique d'abord
router.get('/', bookCtrl.getBooks);
router.get('/:id', bookCtrl.getBookId); // Route dynamique

// Route POST pour ajouter une note à un livre
 // À placer après les routes GET pour éviter les conflits

// Route PUT pour mise à jour
router.put('/:id', auth, upload, optimizeImage, bookCtrl.updateBook);

// Route DELETE pour suppression définitive
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;