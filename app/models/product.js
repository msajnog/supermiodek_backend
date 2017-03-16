var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    name: {
        type: String,
        unique: false,
        required: true
    },
    shortDescription: {
        type: String,
        unique: false,
        required: true
    },
    description: {
        type: String,
        unique: false,
        required: true
    },
    price: {
        type: String,
        unique: false,
        required: true
    },
    image: {
        type: String,
        unique: false,
        required: true
    },
    status: {
        type: String,
        unique: false,
        required: true
    },
    availability: {
        type: Number,
        unique: false,
        min: 0,
        required: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);
