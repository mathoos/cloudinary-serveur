const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configuration de Nodemailer avec les paramètres SMTP de  mon fournisseur (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// Fonction pour envoyer l'e-mail de confirmation
const sendConfirmationEmail = (email) => {
    const mailOptions = {
        from: 'votre_email@example.com', // Adresse e-mail de l'expéditeur
        to: email, // Adresse e-mail du destinataire
        subject: 'Confirmation d\'inscription',
        text: 'Merci de vous être inscrit !', // Contenu texte de l'e-mail
        html: '<h1>Merci de vous être inscrit !</h1>', // Contenu HTML de l'e-mail
    };

    // Utilisation de transporter pour envoyer l'e-mail
    return transporter.sendMail(mailOptions)
        .then(() => console.log("E-mail de confirmation envoyé avec succès."))
        .catch(error => {
            console.error("Erreur lors de l'envoi de l'e-mail:", error);
            throw new Error("Erreur lors de l'envoi de l'e-mail de confirmation");
        });
};

// Exemple d'utilisation dans la fonction signup
exports.signup = (req, res, next) => {
    const { email, password } = req.body;

    // Hash le mot de passe et crée l'utilisateur
    bcrypt.hash(password, 10)
    .then(hash => {
        const user = new User({
            email: email,
            password: hash
        });
        
        user.save()
            .then(() => {
                // Envoi de l'e-mail de confirmation
                return sendConfirmationEmail(email);
            })
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => {
                console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
                return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email de confirmation' });
            });
    })
    .catch(error => {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        return res.status(400).json({ error });
    });
};

// exports.signup = (req, res, next) => {
//     bcrypt.hash(req.body.password, 10)
//     .then(hash => {
//         const user = new User({
//             email: req.body.email,
//             password: hash
//         });
//         user.save()
//             .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
//             .catch(error => res.status(400).json({ error }));
//     })
//     .catch(error => res.status(500).json({ error }));
// };

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
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h' }
                )
            });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};