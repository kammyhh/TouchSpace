var mongoose = require('./mongoose.js');
var crypto = require('crypto');
var Star = require('./star.js');
var userSchema = new mongoose.Schema({
  /*
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `level` int(11) NOT NULL,
   `state` int(11) NOT NULL,
   `username` varchar(50) NOT NULL,
   `isActive` int(11) NOT NULL,
   `recentStar` varchar(50) DEFAULT NULL,
   `phoneNumber` varchar(50) DEFAULT NULL,
   `deviceID` varchar(50) DEFAULT NULL,
   `password` varchar(50) DEFAULT NULL,
   */
  id: String,
  level: Number,
  state: Number,
  username: String,
  isActive: Number,
  recentStar: String,
  phoneNumber: String,
  deviceID: String,
  password: String
}, {
  collection: 'Users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
  this.id = user.id;
  this.level = user.level;
  this.state = user.state;
  this.username = user.username;
  this.isActive = user.isActive;
  this.recentStar = user.recentStar;
  this.phoneNumber = user.phoneNumber;
  this.deviceID = user.deviceID;
  this.password = user.password;
}

User.prototype.save = function(callback) {
  var md5 = crypto.createHash('md5');
  var user = {
    id: Date.now().toString(),
    level: this.level,
    state: this.state,
    username: this.username,
    isActive: this.isActive,
    recentStar: this.recentStar,
    phoneNumber: this.phoneNumber,
    deviceID: this.deviceID,
    password: this.password
  };

  var newUser = new userModel(user);

  newUser.save(function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};

User.get = function(name, callback) {
  userModel.find({name: name}, function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};

User.count = function(callback) {
  userModel.count({}, function(err,count) {
    callback(null, count);
  });
};

User.getUserInfo = function(userid, callback) {
  userModel.findOne({$and: [{isActive: 0}, {username: userid}]}, function(err, result){
    callback(null, result);
  });
};

User.upgrade = function(belong, callback){
  userModel.update({ username: belong, level: { $lt: 2 } }, { $inc: { level: 1 } }, {}, function(){
    console.log('user upgrade done!');
    callback();
  });
};

User.destroy = function(username, callback){
  userModel.update({ username: username }, { $set: { level: 0 } }, {}, function(){
    console.log('user destroy done!');
    callback();
  });
};

module.exports = User;