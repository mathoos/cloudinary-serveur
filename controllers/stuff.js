const Thing = require('../models/Thing');
const fs = require('fs');

// Création d'un nouvel objet avec une image stockée sur Cloudinary
exports.createThing = (req, res, next) => {
    const thingObject = req.body;
    delete thingObject._id;
    delete thingObject._userId;

    // Stocke l'URL de l'image provenant de Cloudinary
    const thing = new Thing({
        ...thingObject,
        userId: req.auth.userId,
        imageUrl: req.file.path // URL de Cloudinary
    });

    thing.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

// Modification d'un objet existant avec une nouvelle image sur Cloudinary
exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ? {
        ...req.body,
        imageUrl: req.file.path // Nouvelle URL de Cloudinary si une image a été modifiée
    } : { ...req.body };

    delete thingObject._userId;
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé !' });
            } else {
                Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

// Suppression d'un objet
exports.deleteThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé !' });
            } else {
                // Aucune suppression physique sur Cloudinary (si nécessaire, il faudrait utiliser l'API de Cloudinary)
                Thing.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};

// Récupération d'un objet spécifique
exports.getOneThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(404).json({ error }));
};

// Récupération de tous les objets
exports.getAllStuff = (req, res, next) => {
    Thing.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
};

// Récupération de tous les objets créés par un utilisateur spécifique
exports.getStuffByUser = (req, res, next) => {
    const userId = req.params.userId;  // L'ID de l'utilisateur est récupéré des paramètres de la requête
    console.log(`Récupération des objets créés par l'utilisateur avec l'ID : ${userId}`);
    
    Thing.find({ userId: userId })
        .then(things => {
            if (things.length === 0) {
                console.log(`Aucun objet trouvé pour l'utilisateur avec l'ID : ${userId}`);
                return res.status(404).json({ message: 'Aucun objet trouvé pour cet utilisateur.' });
            }
            console.log(`Objets trouvés pour l'utilisateur ${userId}:`, things);
            return res.status(200).json(things);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des objets :", error);
            return res.status(500).json({ message: "Erreur serveur" });
        });
};