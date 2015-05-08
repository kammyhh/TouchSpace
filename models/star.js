var mongoose = require('./mongoose.js');
var User = require('./user.js');
var TimeFlow = require('./timeflow.js');
//var ObjectID = require('mongodb').ObjectID;

var starSchema = new mongoose.Schema({
  /*
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `position-x` varchar(100) NOT NULL,
   `position-y` varchar(100) NOT NULL,
   `position-z` varchar(100) NOT NULL,
   `name` varchar(100) NOT NULL,
   `belong` varchar(100) NOT NULL,
   `percent` int(11) NOT NULL DEFAULT '50',
   `level` int(11) NOT NULL,
   `state` int(11) NOT NULL,
   `isDamaged` int(1) NOT NULL DEFAULT '0',
   */
  id: String,
  position_x: String,
  position_y: String,
  position_z: String,
  name: String,
  belong: String,
  percent: Number,
  level: Number,
  state: Number,
  isDamaged: Number
}, {
  collection: 'Stars'
});

var starModel = mongoose.model('Star', starSchema);

function Star(star) {
  this.id = star.id;
  this.position_x = star.position_x;
  this.position_y = star.position_y;
  this.position_z = star.position_z;
  this.name = star.name;
  this.belong = star.belong;
  this.percent = star.percent;
  this.level = star.level;
  this.state = star.state;
  this.isDamaged = star.isDamaged;
};

Star.prototype.save = function(callback) {
  var star = {
    id: Date.now().toString(),
    position_x: this.position_x,
    position_y: this.position_y,
    position_z: this.position_z,
    name: this.name,
    belong: this.belong,
    percent: this.percent,
    level: this.level,
    state: this.state,
    isDamaged: this.isDamaged
  };

  var newStar = new starModel(star);

  newStar.save(function (err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

Star.getStarId = function(belong, callback) {
  starModel.findOne({belong: belong, isDamaged: 0}, function (err, star) {
    callback(null, star);
  });
};

Star.checkExist = function(name, belong, callback) {
  starModel.count({$and: [{$or: [{name: name}, {belong: belong}]}, {isDamaged: 0}]}, function(err,count) {
    callback(null, count);
  });
};

Star.checkNear = function(id, timestamp, level, callback){
  TimeFlow.selectStarId(timestamp, function(err, result){
    var star = [];
    if (result.length){
      for (var i=0; i<result.length; i++){
        star.push(result[i].starid);
      }
    }
    starModel.find({$and: [{id: {$in:star}},{level: level}, {isDamaged: 0 }]},function(err, result){
      callback(null, result);
    });
  });
};

Star.getStars = function(userid, timestamp, callback){
  User.getUserInfo(userid, function(err, result){
    Star.checkNear(userid, timestamp, result.level, function(err, result) {
      callback(null, result);
    });
  });
};

Star.target = function(fromID, toID, callback){
  starModel.find({$and: [{$or: [{id: fromID}, {id: toID}]}, {isDamaged: 0}]}, function(err, result){
    var fromPercent, toPercent, changePercent;
    for(var i=0;i<result.length;i++){
      if(result[i].id==fromID){
        fromPercent=result[i].percent;
      }else if(result[i].id==toID){
        toPercent=result[i].percent;
      }
    }
    callback(null, result, fromPercent,toPercent);
  })
};

Star.upgrade = function(toID, callback){
  starModel.update({ id: toID }, { $set: { percent: 10 } , $inc: { level: 1 } }, {}, function(){
    starModel.findOne({ id: toID }, function(err, result){
      console.log(result.belong);
      User.upgrade(result.belong, function(){
        console.log('star upgrade done!');
        callback();
      });
    })
  });
};

Star.destroy = function(toPercent, toID, callback){
  starModel.update({ id: toID }, { $set: {percent: toPercent, isDamaged: 1 } }, {}, function(){
    console.log('star destroy done!');
    starModel.findOne({id: toID}, function (err, star) {
      User.destroy(star.belong, function(){
        callback();
      });
    });
  });
};

Star.updatePercent = function(fromID, toID, fromPercent, toPercent, callback){
  starModel.update({ id: fromID }, { $set: {percent: fromPercent} }, {}, function(){
    starModel.update({ id: toID }, { $set: {percent: toPercent} }, {}, function(){
      TimeFlow.addFlow(fromID, function(){
        TimeFlow.addFlow(toID, function(){
          console.log('star update percent done!');
          callback();
        });
      });
    });
  });
};

module.exports = Star;