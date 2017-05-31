var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = new Schema({
    statuses: [{
        name: {
            type: String,
            required: true
        }
    }],
    shipmentMethods: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        }
    }],
    payment: {
        name: {
            type: String,
            required: true
        },
        address: {
            street: {
                type: String,
                required: true
            },
            buildingNumber: {
                type: String,
                required: true
            },
            flatNumber: {
                type: String,
                required: true
            },
            postalCode: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            }
        },
        account: {
            type: String,
            required: true
        }
    }
});

module.exports = mongoose.model('Config', ConfigSchema);