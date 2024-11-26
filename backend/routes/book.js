const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const { upload, optimizeImage } = require('../middleware/multer-sharp-config');

// Route POST pour l'ajout
router.post('/', auth, upload, optimizeImage, bookCtrl.addBook);

// Route GET pour affichage
router.get('/', bookCtrl.getBooks);
router.get('/bestrating', bookCtrl.bestrating);
router.get('/:id', bookCtrl.getBookId);



module.exports = router;