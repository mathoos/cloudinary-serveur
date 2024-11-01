const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const objectCtrl = require('../controllers/object');

const { uploadObjectImage } = require('../middleware/multer-config');

router.post('/', auth, uploadObjectImage, objectCtrl.createObject);
router.get('/user/:userId', auth, objectCtrl.getObjectsByUser);
router.get('/', objectCtrl.getAllObjects);
router.get('/:id', auth, objectCtrl.getObjectInfo);
router.put('/:id', auth, uploadObjectImage, objectCtrl.updateObject);
router.delete('/:id', auth, objectCtrl.deleteObject);

module.exports = router;