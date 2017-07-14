const express = require('express');
const router = express.Router();
const passport = require('passport');

const Users = require('../models/users');
const Activity = require('../models/activities');
const Stats = require('../models/stats');

var complete = 0

function retDel(res) {
  if (complete < 1) {
    complete++
    return
  }
  complete = 0;
  return res.json({
    "success": true
  })
}


router.delete('/stats/:id', function(req, res) {
  Stats.findOne({
    "statId": req.params.id
  }).then(function (stat) {
    Users.findOne({
      "uuid": stat.userId
    }).then(function (user) {
      if ((!user) || (user.uuid != req.user.uuid)) {
        return res.status(401).json({
          "success": false,
          "error": "unauthorized"
        })
      }
      Stats.deleteOne({
        "statId": req.params.id
      }).then(function(suc) {
        return res.json({
          "success": true
        })
      }).catch(function(err) {
        console.log('error deleting stat', err);
        res.json(err)
      })
    }).catch(function (err) {
      console.log('error finding user', err);
      return res.json(err)
    })
  }).catch(function (err) {
    console.log('error finding stat', err);
    return res.json(err)
  })
})

router.delete('/activity/:id', function(req, res) {
  Activity.findOne({
    "activityId": req.params.id
  }).then(function (activ) {
    Users.findOne({
      "uuid": activ.userId
    }).then(function (user) {
      if ((!user) || (user.uuid != req.user.uuid)) {
        return res.status(401).json({
          "success": false,
          "error": "unauthorized"
        })
      }
      Activity.deleteOne({
        "activityId": req.params.id
      }).then(function(del) {
        retDel(res)
      }).catch(function(err) {
        console.log('error deleting activity', err);
        return res.json(err)
      })
      Stats.deleteMany({
        "activityId": req.params.id
      }).then(function(del) {
        retDel(res)
      }).catch(function(err) {
        console.log('error deleting stat', err);
        return res.json(err)
      })
    }).catch(function (err) {
      console.log('error finding user', err);
      return res.json(err)
    })
  }).catch(function (err) {
    console.log('error finding activity', err);
    return res.json(err)
  })
})

module.exports = router;
