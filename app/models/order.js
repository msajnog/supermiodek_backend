var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'Nowe'
    },
    client: {
        name: {
            type: String,
            unique: false,
            required: true
        },
        surname: {
            type: String,
            unique: false,
            required: true
        },
        email: {
            type: String,
            unique: false,
            required: true
        },
        phone: {
            type: String,
            unique: false,
            required: true
        },
        shipment: {
            type: String,
            unique: false,
            required: true
        },
        comment: {
            type: String,
            unique: false,
            required: false
        }
    },
    products: [{
        _id: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            unique: false,
            required: true
        },
        image: {
            type: String,
            unique: false,
            required: true
        },
        availability: {
            type: Number,
            unique: false,
            required: true
        },
        price: {
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
        quantity: {
            type: Number,
            unique: false,
            required: true
        }
    }],
    productsTotal: {
        type: Number,
        unique: false,
        required: true
    },
    total: {
        type: Number,
        unique: false,
        required: true
    },
    shipment: {
        _id: {
            type: String,
            unique: true,
            required: false
        },
        name: {
            type: String,
            unique: false,
            required: true
        },
        price: {
            type: Number,
            unique: false,
            required: true
        }
    }
});

module.exports = mongoose.model('Order', OrderSchema);
