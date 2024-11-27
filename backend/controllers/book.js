const Book = require('../models/Book'); 
const fs = require('fs'); // Nécessaire pour gérer la suppression des fichiers

exports.addBook = (req, res, next) => {

    const objetBook = JSON.parse(req.body.book);

    // Suppression du userId présent dans les données de la requête
    delete objetBook.userId;

    // Mise à jour du userId dans chaque élément de ratings (s'il existe)
    if (objetBook.ratings && Array.isArray(objetBook.ratings)) {
        objetBook.ratings = objetBook.ratings.map(rating => ({
            ...rating,
            userId: req.auth.userId // Mise à jour avec le userId authentifié
        }));
    }

    // Création du nouvel objet Book
    const book = new Book({
        userId: req.auth.userId, // Assignation du userId à la création du livre
        ...objetBook,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` /*  car port 4000*/
    });

    // Ajout dans la base de données
    book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré avec succès !' }))
    .catch(error => res.status(400).json({ error }));

};


// Contrôleur pour récupérer tous les livres
exports.getBooks = async (req, res, next) => {
    try {
        // Récupérer tous les livres de la base de données
        const books = await Book.find();
        
        // Retourner les livres au client
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des livres" });
    }
};


// Contrôleur pour récupérer un livre précis
exports.getBookId = (req, res, next) => {

    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));

};


// Contrôleur pour le top 3 des meilleures notes
exports.bestrating = async (req, res, next) => {
    try {
        const topBooks = await Book.find()
            .sort({ averageRating: -1 }) // Trier par moyenne décroissante
            .limit(3); // Limiter à 3 livres

        if (topBooks.length === 0) {
            return res.status(404).json({ message: "Aucun livre trouvé" });
        }

        res.status(200).json(topBooks); // Réponse envoyée
    } catch (error) {
        res.status(500).json({ error });
    }
};


// Contrôleur pour mise à jour d'un livre
exports.updateBook = (req, res, next) => {
    const bookObjet = req.file ? { 
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
        } : { ...req.body }

        delete bookObjet.userId;

        Book.findOne({_id: req.params.id})
            .then((book) => {
                if(book.userId != req.auth.userId) {
                    res.status(401).json({message: 'Non-autorisé'})
                }
                else {

                    // Si une nouvelle image est téléchargée, supprimer l'ancienne image
                    if (req.file && book.imageUrl) {
                        const oldImagePath = book.imageUrl.split('/images/')[1]; // Récupérer le nom du fichier
                        fs.unlink(`images/${oldImagePath}`, (err) => {
                            if (err) console.error('Erreur lors de la suppression de l\'ancienne image :', err);
                        });
                    }

                    Book.updateOne({_id: req.params.id}, { ...bookObjet, _id: req.params.id})
                    .then(() => res.status(200).json({message:'Objet modifié !'}))
                    .catch(error => res.status(401).json({ error }));
                }
            })
            .catch((error) => {
                res.status(400).json({ error });
            })

};


exports.deleteBook = (req, res, next) => {

    Book.findOne({_id: req.params.id})
    .then(book => {
        if(book.userId != req.auth.userId) {
            res.status(401).json({message: 'Non-autorisé'});
        }
        else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                .catch(error => res.status(401).json({ error }));
            })
        }

    })
    .catch(error => {
        res.status(500).json({ error });
    })


    req.auth;

}


exports.ratingBook = async (req, res, next) => {
    try {
        const userId = req.auth.userId; 
        const bookId = req.params.id; 
        const rating = req.body.rating;


        // Vérifiez que les données nécessaires sont présentes
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Note invalide. La note doit être un nombre entre 1 et 5.' });
        }

        // Rechercher le livre à mettre à jour
        const book = await Book.findOne({ _id: bookId });

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Vérifier si l'utilisateur a déjà noté ce livre
        const existingRating = book.ratings.find(r => r.userId === userId);

        if (existingRating) {
            return res.status(409).json({ message: 'Vous avez déjà voté' });
        }

        // Ajouter la nouvelle note
        book.ratings.push({ userId, grade: rating });

        // Recalculer la moyenne des notes
        const totalGrades = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        const averageRating = totalGrades / book.ratings.length;
        book.averageRating = averageRating;

        // Enregistrer les modifications
        await book.save();
        res.status(200).json({...book.toObject(), message: 'Note ajoutée avec succès'});
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la note :', error);
        res.status(500).json({ error });
    }
};

