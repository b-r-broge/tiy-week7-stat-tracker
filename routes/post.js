// routes for all the post requests

const express = require('express');
const router = express.Router();
const passport = require('passport');

const Users = require('../models/users');
const Activity = require('../models/activities');
const Stats = require('../models/stats');

router.post('/activity/:id/stats', function(req, res) {
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
            "statId": Math.floor(Math.random() * 100000)
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

module.exports = router;
