const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images'); // Dossier temporaire pour enregistrer l'image brute
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.')[0]; // Enlever l'extension initiale
        callback(null, `${name}_${Date.now()}.webp`); // Nom temporaire, ajoutera l'extension dans optimizeImage
    }
});

const upload = multer({ storage }).single('image');

const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next(); // Pas de fichier, passe au middleware suivant
    }

    try {
        const name = req.file.filename.split('.')[0]; // Récupérer le nom sans extension
        const inputPath = req.file.path; // Chemin temporaire du fichier brut
        const outputPath = path.join('images', `${name}_${Date.now()}.webp`); // Nom final optimisé

        // Utilisation de Sharp pour convertir et optimiser en WebP
        await sharp(inputPath)
            .resize(500) // Redimensionner à une largeur de 500px tout en gardant les proportions
            .toFormat('webp') // Convertir en WebP
            .webp({ quality: 80 }) // Compression avec une qualité de 80%
            .toFile(outputPath);

        // Supprimer le fichier brut
        fs.unlinkSync(inputPath);

        // Mettre à jour req.file pour pointer vers l'image WebP optimisée
        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath); // Nom final
    } catch (error) {
        console.error("Erreur lors de l'optimisation de l'image :", error);
        return res.status(500).json({ message: "Erreur lors de l'optimisation de l'image" });
    }

    next();
};

module.exports = { upload, optimizeImage };
