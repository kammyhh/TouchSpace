var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tstest');
module.exports = mongoose;