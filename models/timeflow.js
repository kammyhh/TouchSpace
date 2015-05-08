var mongoose = require('./mongoose.js');
var timeFlowSchema = new mongoose.Schema({
  /*
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `starid` int(11) NOT NULL,
   `timestamp` varchar(32) NOT NULL,
   */
  id: String,
  starid: String,
  timestamp: Number
}, {
  collection: 'TimeFlow'
});

var timeFlowModel = mongoose.model('timeFlow', timeFlowSchema);

function TimeFlow(timeFlow) {
  this.id = timeFlow.id;
  this.starid = timeFlow.starid;
  this.timestamp = timeFlow.timestamp;
};

TimeFlow.prototype.save = function(callback) {
  var timeFlow = {
    id: Date.now().toString(),
    starid: this.starid,
    timestamp: this.timestamp
  };

  var newTimeFlow = new timeFlowModel(timeFlow);

  newTimeFlow.save(function (err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

TimeFlow.selectStarId = function(timestamp, callback){
  timeFlowModel.find({timestamp: { $gt: timestamp } },{_id: 0, starid: 1},function(err, result){
    callback(null, result);
  })
};

TimeFlow.addFlow = function(starid, callback){
  var timeFlow = {
    id: Date.now().toString(),
    starid: starid,
    timestamp: Date.now()
  };
  var newTimeFlow = new timeFlowModel(timeFlow);
  newTimeFlow.save(function (err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

module.exports = TimeFlow;