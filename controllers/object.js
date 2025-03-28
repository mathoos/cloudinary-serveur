const Object = require('../models/Object');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


exports.createObject = (req, res, next) => {
    const objectData = req.body;
    delete objectData._id;
    delete objectData._userId;

    const object = new Object({
        ...objectData,
        userId: req.auth.userId,
        imageUrl: req.file.path, 
        publicId: req.file.filename,
        published: req.body.published || false  
    });

    object.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};


exports.getObjectsByUser = (req, res, next) => {
    const userId = req.params.userId;  // L'ID de l'utilisateur est récupéré des paramètres de la requête
    console.log(`Récupération des objets créés par l'utilisateur avec l'ID : ${userId}`);
    
    Object.find({ userId: userId })
    .then(objects => {
        // Au lieu de renvoyer 404, renvoyer un tableau vide si aucun objet n'est trouvé
        if (!objects || objects.length === 0) {
            console.log(`Aucun objet trouvé pour l'utilisateur avec l'ID : ${userId}`);
            return res.status(200).json([]); // Renvoie un tableau vide
        }
        console.log(`Objets trouvés pour l'utilisateur ${userId}:`, objects);
        return res.status(200).json(objects);
    })
    .catch(error => {
        console.error("Erreur lors de la récupération des objets :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    });
};


exports.getAllObjects = (req, res, next) => {
    Object.find()
    .then(objects => res.status(200).json(objects))
    .catch(error => res.status(400).json({ error }));
};


exports.getObjectInfo = (req, res, next) => {
    Object.findOne({ _id: req.params.id })
    .then(object => res.status(200).json(object))
    .catch(error => res.status(404).json({ error }));
};


exports.updateObject = (req, res, next) => {
    const objectData = req.file ? {
        ...req.body,
        imageUrl: req.file.path
    } : { ...req.body };

    delete objectData._userId;

    Object.findOne({ _id: req.params.id })
    .then(object => {
        if (object.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non autorisé !' });
        } 
        else {
            Object.updateOne({ _id: req.params.id }, { ...objectData, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(401).json({ error }));
        }
    })
    .catch(error => res.status(400).json({ error }));
};


exports.deleteObject = (req, res, next) => {
    Object.findOne({ _id: req.params.id })
    .then(object => {
        if (!object) {
            return res.status(404).json({ message: 'Objet non trouvé' });
        }
        if (object.userId !== req.auth.userId) {
            return res.status(401).json({ message: 'Non autorisé !' });
        }

        // Suppression de l'image sur Cloudinary
        cloudinary.uploader.destroy(object.publicId, function(error, result) {
            if (error) {
                console.error("Erreur lors de la suppression de l'image sur Cloudinary :", error);
                return res.status(500).json({ error: 'Échec de la suppression de l\'image Cloudinary' });
            }

            // Suppression de l'objet dans la base de données
            Object.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé avec succès !' }))
            .catch(error => {
                console.error("Erreur lors de la suppression de l'objet dans MongoDB :", error);
                res.status(500).json({ error: 'Échec de la suppression de l\'objet dans MongoDB' });
            });
        });
    })
    .catch(error => {
        console.error("Erreur lors de la recherche de l'objet :", error);
        res.status(500).json({ error: 'Échec de la recherche de l\'objet dans MongoDB' });
    });
};








