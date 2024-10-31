const Thing = require('../models/Thing');


exports.createObject = (req, res, next) => {
    const thingObject = req.body;
    delete thingObject._id;
    delete thingObject._userId;

    const thing = new Thing({
        ...thingObject,
        userId: req.auth.userId,
        imageUrl: req.file.path, 
        publicId: req.file.filename
    });

    thing.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};


exports.getObjectsByUser = (req, res, next) => {
    const userId = req.params.userId;  // L'ID de l'utilisateur est récupéré des paramètres de la requête
    console.log(`Récupération des objets créés par l'utilisateur avec l'ID : ${userId}`);
    
    Thing.find({ userId: userId })
        .then(things => {
            // Au lieu de renvoyer 404, renvoyer un tableau vide si aucun objet n'est trouvé
            if (!things || things.length === 0) {
                console.log(`Aucun objet trouvé pour l'utilisateur avec l'ID : ${userId}`);
                return res.status(200).json([]); // Renvoie un tableau vide
            }
            console.log(`Objets trouvés pour l'utilisateur ${userId}:`, things);
            return res.status(200).json(things);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des objets :", error);
            return res.status(500).json({ message: "Erreur serveur" });
        });
};


exports.getAllObjects = (req, res, next) => {
    Thing.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
};


exports.getObjectInfo = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(404).json({ error }));
};


exports.updateObject = (req, res, next) => {
    const thingObject = req.file ? {
        ...req.body,
        imageUrl: req.file.path
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


exports.deleteObject = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            if (!thing) {
                return res.status(404).json({ message: 'Objet non trouvé' });
            }
            if (thing.userId !== req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé !' });
            }

            // Suppression de l'image sur Cloudinary
            cloudinary.uploader.destroy(thing.publicId, function(error, result) {
                if (error) {
                    console.error("Erreur lors de la suppression de l'image sur Cloudinary :", error);
                    return res.status(500).json({ error: 'Échec de la suppression de l\'image Cloudinary' });
                }

                // Suppression de l'objet dans la base de données
                Thing.deleteOne({ _id: req.params.id })
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








