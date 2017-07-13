const express = require('express');
const router = express.Router();
const passport = require('passport');

const Users = require('../models/users');
const Activities = require('../models/activities');
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

router.post('/activities', function (req, res) {
  // add a new activity for a given user
})

module.exports = router;
