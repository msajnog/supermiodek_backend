var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  name: String,
  shortDescription: String,
  description: String,
  price: Number,
  image: String
});

module.exports = mongoose.model('Product', ProductSchema);
