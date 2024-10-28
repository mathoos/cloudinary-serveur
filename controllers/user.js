const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash,
            nom: req.body.nom,  
            prenom: req.body.prenom,
            genre: req.body.genre,
            profileImageUrl: req.file ? req.file.path : null, 
            profilePublicId: req.file ? req.file.filename : null
        });
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'RANDOM_TOKEN_SECRET', // Utiliser la variable d'environnement
                { expiresIn: '24h' }
            );
            res.status(200).json({
                userId: user._id,
                token: token
            });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getUserInfo = (req, res, next) => {
    const userId = req.auth.userId;  // Récupère l'ID de l'utilisateur authentifié (depuis le middleware d'authentification)
    
    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé !' });
            }
            res.status(200).json({
                nom: user.nom,
                prenom: user.prenom,
                genre: user.genre,
                profileImageUrl: user.profileImageUrl,  // Inclure l'URL de l'image de profil
                profilePublicId: user.profilePublicId
            });
        })
        .catch(error => res.status(500).json({ error }));
};


exports.updateUserInfo = (req, res, next) => {
    const userId = req.auth.userId;  // Récupérer l'ID de l'utilisateur authentifié

    // Objet contenant les nouvelles informations
    const updatedData = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        genre: req.body.genre
    };

    User.findByIdAndUpdate(userId, updatedData, { new: true })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé !' });
            }
            res.status(200).json({ message: 'Informations mises à jour avec succès !', user });
        })
        .catch(error => res.status(500).json({ error }));
};