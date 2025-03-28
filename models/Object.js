const mongoose = require('mongoose');

const objectSchema = mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    tag: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: String, required: true },
    publicId: { type: String, required: true },
    published: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }  
});

module.exports = mongoose.model('Object', objectSchema);