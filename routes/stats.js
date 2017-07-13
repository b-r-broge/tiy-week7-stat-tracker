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
      var newStat = new Stats({
        "date": req.body.date,
        "numberPerformed": req.body.numberPerformed,
        "activityId": req.params.id,
        "userId": user.uuid
      })
      newStat.save().then(function(stat) {
        return res.json({
          "success": true,
          "date": stat.date,
          "numberPerformed": stat.numberPerformed
        })
      }).catch(function(err) {
        console.log('error saving new stat', err);
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

router.post('/activity', function(req, res) {
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
        "activityName": req.body.activity
      })
      newActivity.save().then(function(newActiv) {
        console.log('activity added:', req.body.activity);
        return res.json({
          "success": true,
          "activity": newActiv.activityName
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



module.exports = router;
