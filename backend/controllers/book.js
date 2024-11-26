const Book = require('../models/Book'); 

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
        console.error('Erreur lors de la récupération des livres :', error);
        res.status(500).json({ message: "Erreur lors de la récupération des livres" });
    }
};