const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { uploadObjectImage } = require('../middleware/multer-config');
const stuffCtrl = require('../controllers/stuff');

// Définir les routes
router.get('/', stuffCtrl.getAllStuff);
router.get('/user/:userId', auth, stuffCtrl.getStuffByUser);
router.post('/', auth, uploadObjectImage, stuffCtrl.createThing);  // Utilisez `uploadObjectImage` pour les objets
router.get('/:id', auth, stuffCtrl.getOneThing);
router.put('/:id', auth, uploadObjectImage, stuffCtrl.modifyThing);  // Utilisez `uploadObjectImage` pour les objets
router.delete('/:id', auth, stuffCtrl.deleteThing);

module.exports = router;