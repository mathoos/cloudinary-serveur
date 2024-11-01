const mongoose = require('mongoose');

const objectSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tag: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: String, required: true },
    publicId: { type: String, required: true } 
});

module.exports = mongoose.model('Object', objectSchema);