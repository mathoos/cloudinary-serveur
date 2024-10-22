// const multer = require('multer');

// const MIME_TYPES = {
//     'image/jpg' : 'jpg',
//     'image/jpeg' : 'jpg',
//     'image/png' : 'png',
// }

// const storage = multer.diskStorage({
//     destination : (req, file, callback) => {
//         callback(null, 'images')
//     },
//     filename : (req, file, callback) => {
//         const name = file.originalname.split(' ').join('_');
//         const extension = MIME_TYPES[file.mimetype];
//         callback(null, name + Date.now() + '.' + extension);
//     }
// })

// module.exports = multer({storage}).single('image');


// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');

// const MIME_TYPES = {
//     'image/jpg': 'jpg',
//     'image/jpeg': 'jpg',
//     'image/png': 'png',
// };

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         const dir = path.join(__dirname, '../images');
        
//         // Vérifie si le dossier existe, sinon le crée
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }

//         callback(null, 'images');
//     },
//     filename: (req, file, callback) => {
//         const name = file.originalname.split(' ').join('_');
//         const extension = MIME_TYPES[file.mimetype];
//         callback(null, name + Date.now() + '.' + extension);
//     }
// });

// module.exports = multer({ storage }).single('image');


const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configuration de Cloudinary avec tes informations d'authentification
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);

// 2. Configuration de Multer pour utiliser Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'images',
        allowed_formats: ['jpg', 'jpeg', 'png'], // Formats autorisés
        public_id: (req, file) => file.originalname.split(' ').join('_') + Date.now(), // Génère un nom unique pour chaque fichier
    },
});

// 3. Middleware Multer avec Cloudinary
const upload = multer({ storage });

module.exports = upload.single('image');