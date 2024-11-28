const jwt = require('jsonwebtoken');
const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY;

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodeToken = jwt.verify(token, TOKEN_SECRET_KEY);
        const userId = decodeToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    }
    catch(error) {
        res.status(401).json({ error: 'Utilisateur non connecté'});
    }
};