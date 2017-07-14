const express = require('express');
const router = express.Router();
const passport = require('passport');

const Users = require('../models/users');
const Activity = require('../models/activities');
const Stats = require('../models/stats');

router.get('/check', function (req, res) {
  console.log('in check function');
  res.json({
    "success": true,
    "username": req.user.username
  })
})

// this needs some refactoring
router.post('/activity/:id/stats', function (req, res) {
  // add a new stat to an activity, verify the user owns
  // the activity before adding to db
  Users.findOne({
    "username": req.user.username
  }).then(function(user) {
    Activity.findOne({
      "activityId": req.params.id
    }).then(function(activity) {
      if (!activity) {
        return res.json({
          "success": false,
          "error": "activity does not exist"
        })
      }
      if (activity.userId !== user.uuid) {
        return res.status(401).json({
          "success": false,
          "error": "Not Authorized"
        })
      }
      Stats.findOne({
        "activityId": activity.activityId,
        "userId": user.uuid,
        "date": req.body.date
      }).then(function(oldStat) {
        if (oldStat) {
          // update existing stat
          Stats.updateOne(oldStat, {
            $set: {
              "volume": req.body.volume
            }
          }).then(function(updateStat) {
            return res.json({
              "success": true,
              "date": oldStat.date,
              "volume": req.body.volume
            })
          }).catch(function(err) {
            console.log('error updating stat', err);
            return res.json(err);
          })
        } else {
          var newStat = new Stats({
            "date": req.body.date,
            "volume": req.body.volume,
            "activityId": req.params.id,
            "userId": user.uuid,
            "statId": Math.floor(Math.random()*100000)
          })
          newStat.save().then(function(stat) {
            return res.json({
              "success": true,
              "date": stat.date,
              "volume": stat.volume
            })
          }).catch(function(err) {
            console.log('error saving new stat', err);
            res.json(err);
          })
        }
      }).catch(function(err) {
        console.log('error querying stats', err);
        res.json(err);
      })
    }).catch(function(err) {
      console.log('error finding activity', err);
      res.json(err);
    })
  }).catch(function(err) {
    console.log("error finding user", err);
    res.json(err);
  })
})

router.post('/activity', function (req, res) {
  // add a new activity for a given user
  // expect username, password and activity
  // get user uuid from users collection, then add
  // activity with unique id
  Users.findOne({
    "username": req.user.username
  }).then(function(user) {
    Activity.count({
      // "userId": user.uuid
    }, function(err, num) {
      if (err) {
        return res.json({
          "success": false,
          "error": err
        })
      }
      var newActivity = new Activity({
        "userId": user.uuid,
        "activityId": num,
        "activityName": req.body.activity,
        "activityMetric": req.body.activityMetric
      })
      newActivity.save().then(function(newActiv) {
        console.log('activity added:', req.body.activity);
        return res.json({
          "success": true,
          "activity": newActiv.activityName,
          "activityMetric": newActiv.activityMetric
        })
      }).catch(function(err) {
        console.log('error saving new activity', err);
        res.json(err);
      });
    })
  }).catch(function(err) {
    console.log('error getting user id', err);
    res.json(err);
  });
})

router.get('/activity/:id', function (req, res) {
  Activity.findOne({
    "activityId": req.params.id
  }).then(function (activ) {
    Stats.find({
      "activityId": activ.activityId
    }).then(function (stat) {
      var statLst = []
      stat.map(function (a) {
        statLst.push({
          "date": a.date,
          "volume": a.volume
        })
      })
      var outJson = {
        "success": true,
        "activity": {
          "activityName": activ.activityName,
          "activityMetric": activ.activityMetric
        },
        "stats": statLst
      }
      return res.json(outJson)
    }).catch(function (err) {
      console.log('error getting stats', err);
      return res.json(err)
    })
  }).catch(function (err) {
    console.log('error getting activities', err);
    return res.json(err)
  })
})

router.get('/activity', function (req, res) {
  console.log('getting activities for', req.user.username);
  Users.findOne({
    "username": req.user.username
  }).then(function(user) {
    Activity.find({
      "userId": user.uuid
    }).then(function(activities) {
      var activOut = []
      activities.map(function(a) {
        activOut.push({
          "activity": a.activityName,
          "activityMetric": a.activityMetric,
          "activityLink": "/api/activity/" + a.activityId
        })
      })
      return res.json({
        "success": true,
        "activities": activOut
      })
    }).catch(function(err) {
      console.log("Error getting all activities", err);
      res.json(err);
    })
  }).catch(function(err) {
    console.log(("Error getting user", err));
    res.json(err);
  })
})

router.put('/activity/:id', function (req, res) {
  if (req.body.activityName) {
    Activity.updateOne({
      "activityId": req.params.id
    }, {
      $set: {
        "activityName": req.body.activityName
      }
    }).then(function(activ) {
      res.json({
        "success": true,
        "activityName": req.body.activityName
      })
    }).catch(function(err) {
      console.log("error updating activity", err);
      res.json(err)
    })
  }
  if (req.body.activityMetric) {
    Activity.updateOne({
      "activityId": req.params.id
    }, {
      $set: {
        "activityMetric": req.body.activityMetric
      }
    }).then(function(activ) {
      res.json({
        "success": true,
        "activityMetric": req.body.activityMetric
      })
    }).catch(function(err) {
      console.log("error updating activity", err);
      res.json(err)
    })
  }
})

router.delete('/stats/:id', function (req, res) {
  Stats.deleteOne({
    statId: req.params.id
  }).then(function (suc) {
    return res.json({
      "success": true
    })
  }).catch(function (err) {
    console.log('error deleting stat', err);
    res.json(err)
  })
})

router.delete('/activities/:id')

module.exports = router;
