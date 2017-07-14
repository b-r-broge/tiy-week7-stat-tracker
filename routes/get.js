// Routes for the get requests
const express = require('express');
const router = express.Router();
const passport = require('passport');

const Users = require('../models/users');
const Activity = require('../models/activities');
const Stats = require('../models/stats');

router.get('/activity/:id', function(req, res) {
  Activity.findOne({
    "activityId": req.params.id
  }).then(function(activ) {
    Stats.find({
      "activityId": activ.activityId
    }).then(function(stat) {
      var statLst = []
      stat.map(function(a) {
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
    }).catch(function(err) {
      console.log('error getting stats', err);
      return res.json(err)
    })
  }).catch(function(err) {
    console.log('error getting activities', err);
    return res.json(err)
  })
})

router.get('/activity', function(req, res) {
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

module.exports = router;
