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

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => {
                    // Une fois l'utilisateur créé, envoyez un e-mail de confirmation
                    const mailOptions = {
                        from: 'Lorem Ipsum', // Votre adresse email
                        to: req.body.email, // Email de l'utilisateur qui s'inscrit
                        subject: 'Confirmation d\'inscription',
                        text: `Bienvenue ${req.body.email} ! Votre inscription a bien été prise en compte.`
                    };

                    // Envoi de l'email de confirmation
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Erreur lors de l\'envoi de l\'email:', error);
                            return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email de confirmation' });
                        }
                        console.log('E-mail de confirmation envoyé:', info.response);
                        return res.status(201).json({ message: 'Utilisateur créé et email de confirmation envoyé !' });
                    });
                })
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
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