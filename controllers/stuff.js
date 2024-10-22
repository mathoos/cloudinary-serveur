// const Thing = require('../models/Thing');
// const fs = require('fs');

// exports.createThing = (req, res, next) => {
//     const thingObject = req.body;
//     delete thingObject._id;
//     delete thingObject._userId;
//     const thing = new Thing({
//         ...thingObject,
//         userId: req.auth.userId,
//         imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
//     });

//     thing.save()
//     .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
//     .catch(error => { res.status(400).json( { error })})
// };

// exports.modifyThing = (req, res, next) => {
//     const thingObject = req.file ? {
//         ...req.body,
//         imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
//     } : { ...req.body };
 
//    delete thingObject._userId;
//    Thing.findOne({_id: req.params.id})
//     .then((thing) => {
//         if (thing.userId != req.auth.userId) {
//             res.status(401).json({ message : 'Not authorized'});
//         } 
//         else {
//             Thing.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id})
//             .then(() => res.status(200).json({message : 'Objet modifié!'}))
//             .catch(error => res.status(401).json({ error }));
//         }
//     })
//     .catch((error) => {
//         res.status(400).json({ error });
//     });
// };


//  exports.deleteThing = (req, res, next) => {
//     Thing.findOne({_id: req.params.id})
//     .then( thing => {
//         if (thing.userId != req.auth.userId){
//             res.status(401).json({ message : 'Non autorisé !' });
//         }
//         else{
//             const filename = thing.imageUrl.split('/images/')[1]
//             fs.unlink(`images/${filename}`, (err) => {
//                 if (err) {
//                     res.status(500).json({ error: err });
//                 } else {
//                     Thing.deleteOne({_id : req.params.id})
//                         .then(() => res.status(200).json({message : 'Objet supprimé !'}))
//                         .catch(error => res.status(401).json({ error }));
//                 }
//             });
//         }
//     })
//     .catch((error) => {
//         res.status(500).json({ error });
//     });
// }


// exports.getOneThing = (req, res, next) => {
//     Thing.findOne({
//         _id: req.params.id
//     }).then(
//         (thing) => {
//             res.status(200).json(thing);
//         }
//     ).catch(
//         (error) => {
//             res.status(404).json({
//                 error: error
//             });
//         }
//     );
// };


// exports.getAllStuff = (req, res, next) => {
//     Thing.find().then(
//         (things) => {
//             res.status(200).json(things);
//         }
//     ).catch(
//         (error) => {
//         res.status(400).json({
//             error: error
//         });
//         }
//     );
// };


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
    Thing.findOne({ _id: req.params.id }) // Recherche de l'objet par ID
        .then(thing => {
            if (!thing) {
                return res.status(404).json({ message: 'Objet non trouvé !' });
            }

            // Vérification si l'utilisateur a le droit de supprimer cet objet
            if (thing.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé !' });
            } else {
                // Modifie cette ligne pour s'assurer que tu récupères le bon public_id
                const publicId = thing.imageUrl.split('/').pop().split('.')[0]; // Exemple, à adapter si nécessaire
                console.log('Public ID pour la suppression :', publicId); // Pour débogage
                
                // Supprimer l'image de Cloudinary
                cloudinary.uploader.destroy(publicId, (error, result) => {
                    if (error) {
                        console.error('Erreur lors de la suppression de Cloudinary:', error); // Log de l'erreur
                        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image sur Cloudinary' });
                    } else {
                        // Supprimer l'objet de la base de données
                        Thing.deleteOne({ _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Objet et image supprimés avec succès !' }))
                            .catch(error => {
                                console.error('Erreur lors de la suppression de l\'objet:', error);
                                res.status(401).json({ error });
                            });
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération de l\'objet à supprimer:', error);
            res.status(500).json({ error });
        });
};

exports.deleteThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé !' });
            } else {
                // Supprimer l'image de Cloudinary
                const publicId = thing.imageUrl.split('/').pop().split('.')[0]; // Récupère le public ID de l'URL
                cloudinary.uploader.destroy(publicId, (error, result) => {
                    if (error) {
                        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image sur Cloudinary' });
                    } else {
                        // Supprimer l'objet de la base de données
                        Thing.deleteOne({ _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Objet et image supprimés avec succès !' }))
                            .catch(error => res.status(401).json({ error }));
                    }
                });
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