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
    shipment: {
        unique: false,
    }
});

module.exports = mongoose.model('Order', OrderSchema);
