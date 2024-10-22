// const express = require('express');
// const router = express.Router();

// const auth = require('../middleware/auth');
// const multer = require('../middleware/multer-config');
// const stuffCtrl = require('../controllers/stuff');

// // Définir les routes
// router.get('/', stuffCtrl.getAllStuff);
// router.post('/', auth, multer, stuffCtrl.createThing);
// router.get('/:id', auth, stuffCtrl.getOneThing);
// router.put('/:id', auth, multer, stuffCtrl.modifyThing);
// router.delete('/:id', auth, stuffCtrl.deleteThing);

// module.exports = router;


const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const upload = require('../middleware/multer-config'); // Nouvelle configuration de Multer avec Cloudinary
const stuffCtrl = require('../controllers/stuff');

// Définir les routes
router.get('/', stuffCtrl.getAllStuff);
router.post('/', auth, upload, stuffCtrl.createThing);  // Multer avec Cloudinary
router.get('/:id', auth, stuffCtrl.getOneThing);
router.put('/:id', auth, upload, stuffCtrl.modifyThing);  // Multer avec Cloudinary
router.delete('/:id', auth, stuffCtrl.deleteThing);

module.exports = router;