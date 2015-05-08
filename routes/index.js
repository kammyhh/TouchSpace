var Star = require('../models/star.js');
var User = require('../models/user.js');
var TimeFlow = require('../models/timeflow.js');

module.exports = function(app) {
  app.get('/', function (req, res) {
    res.render('index', {
      title: 'INDEX'
    });
  });

  app.get('/AddStar', function (req, res) {

    x = req.query.x;
    y = req.query.y;
    z = req.query.z;
    name = req.query.name;
    belong = req.query.belong;

    if (x && y && z && name && belong){
      Star.checkExist(name, belong, function(err, count){
        if (count>0){
          res.json({ errorCode: 1 });
        }else {
          var newStar = new Star({
            position_x: x,
            position_y: y,
            position_z: z,
            name: name,
            belong: belong,
            isDamaged: 0,
            percent: 50,
            level: 1,
            state: 1
          });
          newStar.save(function (err) {
            if (err) {
              req.flash('error', err);
            }
            Star.getStarId(belong, function(err, star){
              var newTimeFlow = new TimeFlow({
                starid: star.id,
                timestamp: Date.now()
              });
              newTimeFlow.save(function (err) {
                if (err) {
                  req.flash('error', err);
                }
                res.json({ errorCode: 0 });
              });
            });
          });
        }
      });
  }else{
      res.json({ errorCode: 2 });
  }

  });

  app.get('/AddUser', function (req, res) {
    User.count(function(err,count){
      var usercount = count,
          userId = 10000000+usercount;
      username = 'user' + userId.toString();
      var newUser = new User({
        level: 1,
        state: 1,
        username: username,
        isActive: 0
      });
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
        };
        res.render('index', {
          title: user.username
        });
      });
    });
  });

  app.get('/ChangePercent', function (req, res) {
    fromID = req.query.fromID;
    toID = req.query.toID;
    if(fromID && toID){
      Star.target(fromID, toID, function(err, result, fromPercent, toPercent){
        if (result.length==2){
          if (fromPercent>=1){
            fromPercent = Math.round(fromPercent * 0.5);
            toPercent =  Math.round(toPercent + Math.random()* 2 * fromPercent);
            console.log(1,fromPercent, toPercent);
            if (toPercent>99){
              sec = new Date().getSeconds();
              if (sec>0 && sec<45){
                toPercent = 101;

                console.log(2,fromPercent, toPercent);
              }
            }

            console.log(3,fromPercent, toPercent);
            if (fromPercent>=1 && toPercent<=100){
              Star.updatePercent(fromID, toID, fromPercent, toPercent,function(){
                if (toPercent>99){
                  Star.upgrade(toID,function(){
                    res.json({ errorCode: 0 });
                  });
                }else{
                  res.json({ errorCode: 0 });
                }
              });
            }else if (fromPercent<1){
              res.json({ errorCode: 1 });
            }else if (toPercent>100){
              Star.destroy(toPercent, toID, function(){
                TimeFlow.addFlow(toID, function() {
                  res.json({ errorCode: 0 });
                });
              });
            }
          }else{
            res.json({ errorCode: 3 });
          }
        }else {
          res.json({errorCode: 2});
        }
      });
    }else{
      res.json({ errorCode: 3 });
    }
  });

  app.get('/GetStars', function (req, res) {
    userid = req.query.id;
    timestamp = req.query.timestamp;
    if (userid && timestamp) {
      Star.getStars(userid, timestamp, function (err, result) {
        console.log(result);
        if (result.length == 0) {
          res.json({ errorCode: 1 });
        } else {
          res.json({ errorCode: 0, level: result[0].level, state: result[0].state,
              timestamp: timestamp, stars: result });
        }
      });
    }else{
      res.json({ errorCode: 1 });
    }
  });

  app.get('/generate', function (req, res) {
    for (var i=0; i<1000; i++){
      var userId = 10000000+i;
      username = 'user' + userId.toString();
      var newUser = new User({
        level: 1,
        state: 1,
        username: username,
        isActive: 0
      });
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
        };
      });

      var newStar = new Star({
        position_x: Math.random()*6000 - 3000,
        position_y: Math.random()*6000 - 3000,
        position_z: Math.random()*6000 - 3000,
        name: 'test'+ i.toString(),
        belong: username,
        isDamaged: 0,
        percent: 50,
        level: 1,
        state: 1
      });
      newStar.save(function (err) {
        if (err) {
          req.flash('error', err);
        }
      });

      var newTimeFlow = new TimeFlow({
        starid: Date.now(),
        timestamp: Date.now()
      });
      newTimeFlow.save(function (err) {
        if (err) {
          req.flash('error', err);
        }
      });
    }
    res.send('done');
  });
};
