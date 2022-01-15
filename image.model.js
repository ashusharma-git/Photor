const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    name: String,
    contentType: String
})

module.exports = ImageModel = mongoose.model('imageModel', ImageSchema)