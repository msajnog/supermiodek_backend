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

router.route('/order/:id')
.get(function (req, res) {
    Order.find({_id: req.params.id}, function (err, order) {
        if (err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        res.json({
            status: true,
            data: order[0]
        });
    });
})
.put(function (req, res) {
    Order.update({_id: req.params.id}, req.body, function (err) {
        if (err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        res.json({
            status: true,
            message: 'Zamówienie został zaktualizowane'
        });

    });
})
.delete(function(req, res) {
    var ObjectId = new ObjectID(req.params.id);
    Order.remove({_id: ObjectId}, function (err) {
        if(err) {
            res.send({
                status: false,
                error: err
            });

            return;
        }

        res.json({
            status: true,
            message: 'Zamówienie został usunięte'
        });
    });
});

router.route('/order')
.post(function(req, res) {
    var order = new Order();

    var products = [];

    req.body.products.forEach(function(product) {
        products.push({
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
        });
    });

    order.client = req.body.client;
    order.products = products;
    order.productsTotal = req.body.productsTotal;
    order.total = req.body.total;
    order.shipment.id = req.body.shipment._id;
    order.shipment.name = req.body.shipment.name;
    order.shipment.price = req.body.shipment.price;

    order.save(function(err) {
        if (err) {
            console.log(err);
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

        var productsList = `<table width="100%" cellspacing="0" style="width: 100%; text-align: left; border: 1px solid grey; border-bottom: 0; margin: 10px 0 30px 0;">
        <tr>
        <th style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">Nazwa</th>
        <th style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">Ilość</th>
        <th style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">Cena</th>
        <th style="padding:5px; border-bottom: 1px solid grey; ">Suma</th>
        </tr>`;
        order.products.forEach(function(product) {
            productsList += `<tr>
            <td style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">${product.name}</td>
            <td style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">${product.quantity}</td>
            <td style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">${product.price} zł</td>
            <td style="padding:5px; border-bottom: 1px solid grey;">${parseFloat(product.price)*product.quantity} zł</td>
            </tr>`;
        });

        productsList += `</table>`;

        let mailOptions = {
            from: '"Supermiodek"', // sender address
            to: req.body.client.email, // list of receivers
            subject: 'Zamówienie z Supermiodek.pl', // Subject line
            text: 'Hello world ?', // plain text body
            html: `<table width="600" style="width: 600px">
            <tr><td><h1>Dzień dobry ${order.client.name} ${order.client.surname}</td></tr>
            <tr><td><b>Lista zamówionych produktów:</b></td></tr>
            <tr><td>${productsList}</td></tr>
            <tr><td><b>Adres dostawy:</b></td></tr>
            <tr><td style="padding-bottom: 15px;">${order.client.shipment}</td></tr>
            <tr><td><b>Sposób dostawy:</b></td></tr>
            <tr><td style="padding-bottom: 15px;">${order.shipment.name} ${order.shipment.price} zł</td></tr>
            <tr><td><b>Dane do płatności:</b></td></tr>
            <tr><td style="padding-bottom: 15px;">Jan Kowalski<br>ul. Warszawska 7/23<br>22-900 Lublin<br>Nr konta: 1234 1234 1234 1234 1234</td></tr>
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
