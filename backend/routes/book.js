const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const { upload, optimizeImage } = require('../middleware/multer-sharp-config');

// Route POST pour l'ajout
router.post('/', auth, upload, optimizeImage, bookCtrl.addBook);

// Routes GET pour affichage
router.get('/bestrating', bookCtrl.bestrating); // Routes spécifiques en premier
router.get('/', bookCtrl.getBooks);
router.get('/:id', bookCtrl.getBookId); // Route dynamique en dernier

// Route PUT pour mise à jour
router.put('/:id', auth, upload, optimizeImage, bookCtrl.updateBook); 

// Route DELETE pour suppression définitive
router.delete('/:id', auth, bookCtrl.deleteBook);



module.exports = router;