const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/multer-config'); 

router.post('/signup', uploadProfileImage, userCtrl.signupUser);
router.post('/login', userCtrl.loginUser);
router.get('/me', auth, userCtrl.getUserInfo);
router.put('/me', auth, uploadProfileImage, userCtrl.updateUserInfo);

module.exports = router;