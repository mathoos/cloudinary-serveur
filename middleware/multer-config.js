const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration pour les photos de profil
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_images',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        public_id: (req, file) => file.originalname.split(' ').join('_') + Date.now(),
    },
});

// Configuration pour les images des objets
const objectStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'images',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        public_id: (req, file) => file.originalname.split(' ').join('_') + Date.now(),
    },
});

const uploadProfileImage = multer({ storage: profileStorage });
const uploadObjectImage = multer({ storage: objectStorage });

module.exports = {
    uploadProfileImage: uploadProfileImage.single('image'),
    uploadObjectImage: uploadObjectImage.single('image')
};