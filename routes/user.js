const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/multer-config'); 

router.post('/signup', uploadProfileImage, userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/me', auth, userCtrl.getUserInfo);
router.put('/me', auth, uploadProfileImage, userCtrl.updateUserInfo);

module.exports = router;