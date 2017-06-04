var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    status: [{
        unique: false,
        name: {
            type: String,
            required: false,
        },
        _id: {
            type: String,
            unique: false,
        },
        selected: {
            type: Boolean
        }
    }],
    client: {
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        shipment: {
            type: String,
            required: true
        },
        comment: {
            type: String,
            required: false
        }
    },
    products: [{
        unique: false,
        id: {
            type: String,
            unique: false
        },
        name: {
            type: String,
            unique: false
        },
        price: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    }],
    productsTotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    shipments: [{
        unique: false,
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        selected: {
            type: Boolean
        }
    }]
});

module.exports = mongoose.model('Order', OrderSchema);
