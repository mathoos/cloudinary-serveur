const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const stuffCtrl = require('../controllers/stuff');
const { uploadObjectImage } = require('../middleware/multer-config');

router.post('/', auth, uploadObjectImage, stuffCtrl.createObject);
router.get('/user/:userId', auth, stuffCtrl.getObjectsByUser);
router.get('/', stuffCtrl.getAllObjects);
router.get('/:id', auth, stuffCtrl.getObjectInfo);
router.put('/:id', auth, uploadObjectImage, stuffCtrl.updateObject);
router.delete('/:id', auth, stuffCtrl.deleteObject);

module.exports = router;