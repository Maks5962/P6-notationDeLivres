// Importation des modules nécessaires
const http = require('http'); // Module intégré de Node.js pour créer un serveur HTTP
const app = require('./app'); // Application locale Express

// Fonction pour normaliser le port (convertir une valeur en un port valide)
const normalizePort = val => {
  const port = parseInt(val, 10); // Convertit la valeur en entier

  if (isNaN(port)) {
    return val; // Si ce n'est pas un nombre, on retourne tel quel (exemple : un nom de pipe)
  }
  if (port >= 0) {
    return port; // Si c'est un entier positif, retourne ce port
  }
  return false; // Sinon, retourne `false` pour signaler une erreur
};

// Définir le port sur lequel le serveur va écouter
const port = normalizePort(process.env.PORT || '4000'); // Priorise une variable d'environnement ou utilise '3000' par défaut
app.set('port', port); // Configure le port dans l'application (utile si c'est Express)

// Gestion des erreurs serveur avec une fonction dédiée
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error; // Relance les erreurs qui ne sont pas liées à l'écoute du serveur
  }

  const address = server.address(); // Obtient l'adresse utilisée par le serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // Formatte l'adresse ou le port

  switch (error.code) { // Vérifie le type d'erreur
    case 'EACCES': // Erreur : permissions insuffisantes
      console.error(bind + ' requires elevated privileges.');
      process.exit(1); // Quitte le processus avec un code d'erreur
      break;
    case 'EADDRINUSE': // Erreur : port déjà utilisé
      console.error(bind + ' is already in use.');
      process.exit(1); // Quitte le processus avec un code d'erreur
      break;
    default: // Autres types d'erreurs
      throw error; // Relance l'erreur
  }
};

// Création du serveur HTTP en utilisant l'application comme gestionnaire de requêtes
const server = http.createServer(app);

// Attache la gestion des erreurs au serveur
server.on('error', errorHandler);

// Événement déclenché lorsque le serveur commence à écouter
server.on('listening', () => {
  const address = server.address(); // Récupère les informations sur l'adresse ou le port du serveur
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; // Formatte l'adresse ou le port
  console.log('Listening on ' + bind); // Affiche un message dans la console
});

// Le serveur commence à écouter sur le port configuré
server.listen(port);
