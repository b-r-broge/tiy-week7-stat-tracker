const express = require('express');
const router = express.Router();
const passport = require('passport');

const Users = require('../models/users');
const Activity = require('../models/activities');
const Stats = require('../models/stats');

// Skip authentication for now, get the rest of the
// end points working before trying it again.
//
// router.get('/check', passport.authenticate('basic', {
//   session: false
// }), function (req, res) {
//   res.json({
//     "success": true,
//     "username": req.body.username
//   })
// })

router.post('/activity', function(req, res) {
  // add a new activity for a given user
  // expect username, password and activity
  // get user uuid from users collection, then add
  // activity with unique id
  Users.findOne({
    "username": req.body.username
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
        res.json({
          "success": true,
          "activity": req.body.activity
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
