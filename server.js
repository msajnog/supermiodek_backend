// server.js

// BASE SETUP
// =============================================================================
'use strict';
// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
// var db = require('mongodb').Db;
var ObjectID = require('mongodb').ObjectID;
var config = require('./config/database');
// var jwt = require('jwt-simple');
// var fs = require('fs');
var multiparty = require('connect-multiparty');

// Konfiguracja
// https://www.google.com/settings/security/lesssecureapps - Turn on
// https://accounts.google.com/DisplayUnlockCaptcha
const nodemailer = require('nodemailer');

var Product = require('./app/models/product');
var Order = require('./app/models/order');

var port = process.env.PORT || 8080; // set our port

mongoose.connect(config.database);
require('./config/passport')(passport);

// require('./config/passport')(passport);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

app.use(express.static(__dirname + '/media'));

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)

router.use(function(req, res, next) {
    console.log('Something is happening');
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

router.get('/', function(req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

// MOVIE ROUTES
router.route('/products')
    .post(function(req, res) {
        var product = new Product();

        product.name = req.body.name;
        product.shortDescription = req.body.shortDescription;
        product.description = req.body.description;
        product.price = req.body.price;
        product.status = req.body.status;
        product.availability = req.body.availability;
        product.image = req.body.image;

        product.save(function(err) {
            if (err) {
                res.send({
                    status: false,
                    error: err
                });

                return;
            }

            res.json({
                status: true,
                message: 'Produkt został dodany'
            });
        });
    })
    .get(function(req, res) {
        Product.find(function(err, products) {
            if (err) {
                res.send({
                    status: false,
                    error: err
                });
            }

            res.json({
                status: true,
                data: products
            });
        });
    });

router.route('/product/:id')
.get(function (req, res) {
    Product.find({_id: req.params.id}, function (err, product) {
        if (err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        res.json({
            status: true,
            data: product[0]
        });
    });
})
.put(function (req, res) {
    Product.update({_id: req.params.id}, req.body, function (err) {
        if (err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        res.json({
            status: true,
            message: 'Produkt został zaktualizowany'
        });

    });
})
.delete(function(req, res) {
    var ObjectId = new ObjectID(req.params.id);
    Product.remove({_id: ObjectId}, function (err) {
        if(err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        res.json({
            status: true,
            message: 'Produkt został usunięty'
        });
    });
});

router.route('/products/:status')
.get(function(req, res) {
    Product.find({$and: [{"status": req.params.status}, {"availability": {$gt: 0}}]}, function(err, products) {
        if (err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        res.json({
            status: true,
            data: products
        });
    });
});

router.post('/upload', multiparty({
    uploadDir: './media'
}), function(req, res) {
    var file = req.files.file;

    var imageName = file.path.split('/').reverse()[0];

    res.status(200).send({
        status: true,
        path: imageName
    });
});

router.route('/orders')
.get(function(req, res) {
    Order.find(function(err, orders) {
        if (err) {
            res.send({
                status: false,
                error: err
            });
        }

        res.json({
            status: true,
            data: orders
        });
    });
});

router.route('/order')
.post(function(req, res) {
    console.log(req.body);
    var order = new Order();

    order.client = req.body.client;
    order.products = req.body.products;
    order.productsTotal = req.body.productsTotal;
    order.total = req.body.total;
    order.shipment = req.body.shipment;

    order.save(function(err) {
        if (err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        //============ SEND EMAIL ==================//
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sajnogmat@gmail.com',
                pass: 'corellon'
            }
        });

        var productsList = `<table><tr><th>Nazwa</th><th>Ilość</th><th>Cena</th><th>Suma</th>`;
        order.products.forEach(function(product) {
            productsList += `<tr>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.price}</td>
            <td>${parseFloat(product.price)*product.quantity}</td></tr>`
        });

        productsList += `</table>`;

        let mailOptions = {
            from: '"Supermiodek"', // sender address
            to: req.body.client.email, // list of receivers
            subject: 'Zamówienie z Supermiodek.pl', // Subject line
            // text: 'Hello world ?', // plain text body
            html: `<table style="width: 100%">
            <tr><td><h1>Dzień dobry ${order.client.name} ${order.client.surname}</td></tr>
            <tr><td>Lista zamówionych produktów:</td></tr>
            <tr><td>${productsList}</td></tr>
            <tr><td>Adres dostawy:</td></tr>
            <tr><td>${order.client.shipment}</td></tr>
            <tr><td>Sposób dostawy:</td></tr>
            <tr><td>${order.shipment.name} ${order.shipment.price} zł</td></tr>
            </table>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
        //============ SEND EMAIL ==================//

        res.json({
            status: true,
            message: 'Zamówienie zostało złożone. Na podany adres otrzymasz maila z potwierdzeniem'
        });
    });
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);
