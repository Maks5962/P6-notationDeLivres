const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// Route POST pour l'inscription
router.post('/signup', userCtrl.signup);

// Route POST pour l'authentification
router.post('/login', userCtrl.login);

module.exports = router;