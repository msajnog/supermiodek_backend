// server.js

// BASE SETUP
// =============================================================================
'use strict';
// call the packages we need
const express = require('express'); // call express
const app = express(); // define our app using express
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
// var db = require('mongodb').Db;
const ObjectID = require('mongodb').ObjectID;
const config = require('./config/database');
var jwt = require('jwt-simple');
// var fs = require('fs');
const multiparty = require('connect-multiparty');
const fs = require('fs');

// Konfiguracja
// https://www.google.com/settings/security/lesssecureapps - Turn on
// https://accounts.google.com/DisplayUnlockCaptcha
const nodemailer = require('nodemailer');

const Product = require('./app/models/product');
const Order = require('./app/models/order');
const Config = require('./app/models/config');
const User = require('./app/models/user');
const path = require('path');

const port = process.env.PORT || 8080; // set our port

mongoose.connect(config.database);
require('./config/passport')(passport);

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

app.use('/media', express.static(path.join(__dirname, 'media')));

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)

router.use(function (req, res, next) {
  console.log('Something is happening');
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

router.get('/', function (req, res) {
  res.json({
    message: 'hooray! welcome to our api!'
  });
});

// START THE SERVER
// =============================================================================
var serverAddress;
var server = app.listen(port, '127.0.0.1', () => {
  serverAddress = server.address();
});

// MOVIE ROUTES
router.route('/products')
    .post(function (req, res) {
      let product = new Product();

      product.name = req.body.name;
      product.shortDescription = req.body.shortDescription;
      product.description = req.body.description;
      product.price = req.body.price;
      product.status = req.body.status;
      product.availability = req.body.availability;
      product.image = req.body.image;

      product.save(function (err) {
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
    .get(function (req, res) {
      Product.find(function (err, products) {
        if (err) {
          res.send({
            status: false,
            error: err
          });
        }

        products.forEach(product => {
          product.image = `http://${serverAddress.address}:${serverAddress.port}/${product.image}`
        });

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
    .delete(function (req, res) {
      let ObjectId = new ObjectID(req.params.id);
      Product.remove({_id: ObjectId}, function (err) {
        if (err) {
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
    .get(function (req, res) {
      Product.find({$and: [{"status": req.params.status}, {"availability": {$gt: 0}}]}, function (err, products) {
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
      }).sort({_id: 1});
    });

router.post('/upload', multiparty({
  uploadDir: './media'
}), function (req, res) {
  let file = req.files.file;

  let imageName = file.path.split('/').reverse()[0];

  res.status(200).send({
    status: true,
    path: imageName
  });
});

router.route('/orders')
    .get(function (req, res) {
      Order.find(function (err, orders) {
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
    .delete(function (req, res) {
      var ObjectId = new ObjectID(req.params.id);
      Order.remove({_id: ObjectId}, function (err) {
        if (err) {
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
    .post(function (req, res) {
      let order = new Order();
      let products = [];
      let payment = {};
      let activeShipment = {};

      Config.find(function (err, config) {
        config[0].statuses.forEach(function (status, index) {
          order.status.push(status);
          order.status[order.status.length - 1].selected = index === 0;
        });

        config[0].shipmentMethods.forEach(function (method) {
          order.shipments.push(method);

          order.shipments[order.shipments.length - 1].selected = req.body.shipment._id.toString() === method._id.toString();
          if (req.body.shipment._id.toString() === method._id.toString()) {
            activeShipment = method;
          }
        });

        req.body.products.forEach(function (orderedProduct) {
          products.push({
            id: orderedProduct._id,
            name: orderedProduct.name,
            price: orderedProduct.price,
            quantity: orderedProduct.quantity,
            image: orderedProduct.image
          });

          var newAvailability = orderedProduct.availability - orderedProduct.quantity;
          Product.update({_id: orderedProduct._id}, {availability: newAvailability}, function (err, message) {
          });
        });

        order.client = req.body.client;
        order.products = products;
        order.productsTotal = req.body.productsTotal;
        order.total = req.body.total;

        order.save(function (err) {
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

          payment = config[0].payment;

          var productsList = `<table width="100%" cellspacing="0" style="width: 100%; text-align: left; border: 1px solid grey; border-bottom: 0; margin: 10px 0 30px 0;">
            <tr>
            <th style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">Nazwa</th>
            <th style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">Ilość</th>
            <th style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">Cena</th>
            <th style="padding:5px; border-bottom: 1px solid grey; ">Suma</th>
            </tr>`;
          order.products.forEach(function (product) {
            productsList += `<tr>
                <td style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">${product.name}</td>
                <td style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">${product.quantity}</td>
                <td style="padding:5px; border-bottom: 1px solid grey; border-right: 1px solid grey;">${product.price} zł</td>
                <td style="padding:5px; border-bottom: 1px solid grey;">${(parseFloat(product.price) * product.quantity).toFixed(2)} zł</td>
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
                <tr><td style="padding-bottom: 15px;">${activeShipment.name} ${activeShipment.price} zł</td></tr>
                <tr><td><b>Dane do płatności:</b></td></tr>
                <tr><td style="padding-bottom: 15px;">
                ${payment.name}<br>
                ul. ${payment.address.street} ${payment.address.buildingNumber}/${payment.address.buildingNumber}<br>
                ${payment.address.postalCode} ${payment.address.city}<br>
                Nr konta: ${payment.account}
                </td></tr>
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
            message: 'Zamówienie zostało przyjęte. Na podany adres otrzymasz wiadomość z potwierdzeniem.'
          });
        });
      });

    });

router.route('/config')
    .get(function (req, res) {
      Config.find(function (err, config) {
        console.log(config);
        if (err) {
          res.send({
            status: false,
            error: err
          });
        }

        res.json({
          status: true,
          data: config[0]
        });
      });
    })
    .post(function (req, res) {
      let config = new Config(req.body);

      config.save(function (err) {
        if (err) {
          res.send({
            status: false,
            error: err
          });

          return;
        }

        res.json({
          status: true,
          message: 'Konfiguracja została zapisana'
        });
      });
    });

router.route('/config/:id')
    .put(function (req, res) {
      Config.update({_id: req.params.id}, req.body, function (err) {
        if (err) {
          res.send({
            status: false,
            error: err
          });

          return;
        }

        res.json({
          status: true,
          message: 'Konfiguracja została zaktualizowana'
        });

      });
    });

router.route('/config/shipmentMethods')
    .get(function (req, res) {
      Config.find(function (err, config) {
        if (err) {
          res.send({
            status: false,
            error: err
          });
        }

        res.json({
          status: true,
          data: config[0].shipmentMethods
        });
      });
    });

router.post('/signup', function (req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({status: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
  }

  newUser.save(function (err) {
    if (err) {
      return res.json({status: false, msg: 'Username already exists.'});
    }
    res.json({status: true, msg: 'Successful created new user.'});
  });
});

router.post('/authenticate', function (req, res) {
  User.findOne({
    name: req.body.name
  }, function (err, user) {
    if (err) throw err;
    console.log('user', user);

    if (!user) {
      res.send({status: false, msg: 'Authentication failed. User not found'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.send({status: true, token: 'JWT ' + token});
          console.log({status: true, token: 'JWT ' + token});
        } else {
          res.send({status: false, msg: 'Niepoprawne hasło'});
        }
      });
    }
  });
});

router.post('/contact', function (req, res) {
  Config.findOne(function (err, config) {

    let contact = req.body;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sajnogmat@gmail.com',
        pass: 'corellon'
      }
    });

    let mailOptions = {
      from: `${contact.name} <${contact.email}>`, // sender address
      to: 'sajnogmat@gmail.com', // list of receivers
      subject: contact.subject, // Subject line
      text: `${contact.name}, ${contact.email}, ${contact.phone}, ${contact.subject} ${contact.content}`, // plain text body
      html: `<table width="600" style="width: 600px; margin: 0 auto;">
                <tr><td width="110"><b>Imię i nazwisko:</b></td><td>${contact.name}</tr>
                <tr><td width="110"><b>E-mail:</b></td><td>${contact.email}</tr>
                <tr><td width="110"><b>Telefon:</b></td><td>${contact.phone}</tr>
                <tr><td width="110"><b>Temat:</b></td><td>${contact.subject}</tr>
                <tr><td width="110"><b>Treść:</b></td><td>${contact.content}</tr>
                </table>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });

    if (contact.sendCopy) {
      mailOptions.to = contact.email;

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
      });
      //============ SEND EMAIL ==================//
    }

    res.json({
      status: true,
      message: 'Wiadomość została wysłana'
    });
  });

});

router.route('/temperatures')
    .get(function(req, res) {
      const __dirname = './data/temperatures';
      let temperatures = [];

      const fileList = fs.readdirSync(__dirname);

      fileList.forEach(function(fileName) {
        const filePath = `${__dirname}/${fileName}`;
        let fileData = null;
        let date = fileName.split('.')[0];

        fileData = fs.readFileSync(filePath, 'utf8');
        fileData = fileData.trim().split('\n');
        fileData.shift();
        fileData.map(function(values) {
          let valuesArray = values.split(',');
          let time = valuesArray.shift();

          temperatures.push({
            time: `${date}:${time}`,
            data: valuesArray
          });
        });
      });

      temperatures.sort(function(temp1, temp2) {
        return new Date(temp2.time) - new Date(temp1.time);
      });

      res.send(temperatures);
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


console.log('There will be dragons: http://localhost:' + port);
