const express = require('express');
const router = express.Router();
const passport = require('passport');

const Users = require('../models/users');
const Activity = require('../models/activities');
const Stats = require('../models/stats');

router.get('/check', function(req, res) {
  console.log('in check function');
  res.json({
    "success": true,
    "username": req.user.username
  })
})

router.put('/activity/:id', function(req, res) {
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

module.exports = router;
