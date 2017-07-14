const assert = require("assert");
const request = require("supertest");
const app = require('../app');

const Users = require('../models/users')
const Activity = require('../models/activities')
const Stats = require('../models/stats')

// Sign up a new user
describe('POST /api/signup - add a user to the database', function() {
  before('reset the test database', function(done) {
    Users.remove({}).then(function() {});
    Activity.remove({}).then(function() {});
    Stats.remove({}).then(function() {});

    setTimeout(function() {
      return done();
    }, 500);
  })

  it('Should add user "Reynard" to the user collection', function(done) {
    request(app).post('/api/signup')
      .send({
        "username": "Reynard",
        "password": "l3tsB4rkMor3"
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect({
        "success": true,
        "newUsername": "Reynard"
      })
      .end(done)
  });
  it('Should add user "Seymour" to the user collection', function(done) {
    request(app).post('/api/signup')
      .send({
        "username": "Seymour",
        "password": "l3tsE4tL3aves"
      })
      .expect(200)
      .expect({
        "success": true,
        "newUsername": "Seymour"
      })
      .end(done)
  });
  it('Should verify there are 2 users in the DB', function (done) {
    Users.count({}).then(function(num) {
      assert.equal(num, 2);
      done();
    })
  })
})

// sanity check for passport basic auth - come back to later
describe('GET /api/check - It should verify a correct signin', function() {
  it('Should return that brad:test is an invalid user:pass', function(done) {
    request(app).get('/api/check')
    .auth("brad", "test")
    .expect(401)
    .end(done)
  })
  it('Should return that Reynard:l3tsB4rkMor3 is a valid user:pass', function(done) {
    request(app).get('/api/check')
      .auth("Reynard", "l3tsB4rkMor3")
      .expect(200)
      .expect({
        "success": true,
        "username": "Reynard"
      })
      .end(done)
  })
})

// Add a new activity for a user
describe('POST /api/activity', function () {
  it('Should add an activity with a uuid to the database - verify one can be added', function (done) {
    request(app).post('/api/activity')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "activity": "barking",
      "activityMetric": "frequency"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activity": "barking",
      "activityMetric": "frequency"
    })
    .end(done)
  })
  it('Should add an activity to the database - verify uuid and activityId are calculated separately', function (done) {
    request(app).post('/api/activity')
    .auth("Seymour", "l3tsE4tL3aves")
    .send({
      "activity": "sleeping",
      "activityMetric": "hours"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activity": "sleeping",
      "activityMetric": "hours"
    })
    .end(done)
  })
  it('Should add an activity with a uuid to the database - verify activityId is unique', function (done) {
    request(app).post('/api/activity')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "activity": "sleeping",
      "activityMetric": "hours"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activity": "sleeping",
      "activityMetric": "hours"
    })
    .end(done)
  })
  it('Should verify there are 3 activities in the DB', function (done) {
    Activity.count({}).then(function(num) {
      assert.equal(num, 3);
      done();
    })
  })
})

// Get all the activities for a user
describe("GET /api/activity", function () {
  it('should return all activities for Reynard', function(done) {
    request(app).get('/api/activity')
    .auth("Reynard", "l3tsB4rkMor3")
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activities": [
        {
          "activity": "barking",
          "activityMetric": "frequency",
          "activityLink": "/api/activity/0"
        },
        {
          "activity": "sleeping",
          "activityMetric": "hours",
          "activityLink": "/api/activity/2"
        }
      ]
    })
    .end(done);
  })
  it('should return all activities for Seymour', function(done) {
    request(app).get('/api/activity')
    .auth("Seymour", "l3tsE4tL3aves")
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activities": [
        {
          "activity": "sleeping",
          "activityMetric": "hours",
          "activityLink": "/api/activity/1"
        }
      ]
    })
    .end(done);
  })
})

// Add a stat to a given activity and day
describe('POST /api/activity/:id/stats', function() {
  it('should deny modifiying an activity you don\'t own', function (done) {
    request(app).post('/api/activity/1/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "volume": 12
    })
    .expect(401)
    .end(done)
  })
  it('should deny modifiying an activity when you don\'t authorize', function (done) {
    request(app).post('/api/activity/1/stats')
    .send({
      "date": "7/11/17",
      "volume": 12
    })
    .expect(401)
    .end(done)
  })
  it('Should stop you to adding a stat for an invalid activity', function (done) {
    request(app).post('/api/activity/5/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "volume": 12
    })
    .expect({
      "success": false,
      "error": "activity does not exist"
    })
    .end(done)
  })
  it('Should allow you to add a stat to an activity you own', function (done) {
    request(app).post('/api/activity/0/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "volume": 12
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "volume": 12
    })
    .end(done)
  })
  it('Should allow you to overwrite a stat you own', function (done) {
    request(app).post('/api/activity/0/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "volume": 1000
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "volume": 1000
    })
    .end(done)
  })
  it('Should allow you to add a stat to an activity you own', function (done) {
    request(app).post('/api/activity/1/stats')
    .auth("Seymour", "l3tsE4tL3aves")
    .send({
      "date": "7/11/17",
      "volume": 10
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "volume": 10
    })
    .end(done)
  })
  it('Should allow you to add a stat to an activity you own', function (done) {
    request(app).post('/api/activity/2/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "volume": 4
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "volume": 4
    })
    .end(done)
  })
  it('Should verify there are 3 stats in the DB', function (done) {
    Stats.count({}).then(function(num) {
      assert.equal(num, 3);
      done();
    })
  })
})

// Update activity name or metric
describe('PUT /api/activity/:id', function () {
  it('Should update Reynards barking frequency to barks per hour', function (done) {
    request(app).put('/api/activity/0')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "activityMetric": "barks per hour"
    })
    .expect(200)
    .expect({
      "success": true,
      "activityMetric": "barks per hour"
    })
    .end(done)
  })
  it('Should update Seymours sleeping to being happy', function (done) {
    request(app).put('/api/activity/1')
    .auth("Seymour", "l3tsE4tL3aves")
    .send({
      "activityName": "being happy"
    })
    .expect(200)
    .expect({
      "success": true,
      "activityName": "being happy"
    })
    .end(done)
  })
})

// Get specific information about an activity
describe('GET /api/activty/:id', function () {
  // add more dates for the stats
  before('Add stats to be tracked', function (done) {
    Stats.bulkWrite([
      {
        insertOne: {
          document: {
            date: "7/12/17",
            volume: 50,
            activityId: 0,
            userId: 0,
            statId: Math.floor(Math.random()*100000)
          }
        }
      },
      {
        insertOne: {
          document: {
            date: "7/13/17",
            volume: 500,
            activityId: 0,
            userId: 0,
            statId: 456
          }
        }
      },
      {
        insertOne: {
          document: {
            date: "7/12/17",
            volume: 24,
            activityId: 1,
            userId: 1,
            statId: 123
          }
        }
      }
    ]).then(function () {
      done()
    }).catch(function () {
      done()
    })
  })
  it('Should return information about Seymour being happy', function (done) {
    request(app).get('/api/activity/1')
    .auth("Seymour", "l3tsE4tL3aves")
    .expect(200)
    .expect({
      "success": true,
      "activity": {
        "activityName": "being happy",
        "activityMetric": "hours"
      },
      "stats": [
        {
          "date": "7/11/17",
          "volume": 10
        },
        {
          "date": "7/12/17",
          "volume": 24
        }
      ]
    })
    .end(done)
  })
  it('Should return information about Reynard barking', function (done) {
    request(app).get('/api/activity/0')
    .auth("Reynard", "l3tsB4rkMor3")
    .expect(200)
    .expect({
      "success": true,
      "activity": {
        "activityName": "barking",
        "activityMetric": "barks per hour"
      },
      "stats": [
        {
          "date": "7/11/17",
          "volume": 1000
        },
        {
          "date": "7/12/17",
          "volume": 50
        },
        {
          "date": "7/13/17",
          "volume": 500
        }
      ]
    })
    .end(done)
  })
})

// Delete one day's worth of tracked activities
describe('DELETE /api/stats/:id', function () {
  it('should prevent Reynards from deleting Seymours stats', function (done) {
    request(app).delete('/api/stats/123')
    .auth("Reynard", "l3tsB4rkMor3")
    .expect(401)
    .end(done)
  })
  it('should delete one day of Seymour being happy', function (done) {
    request(app).delete('/api/stats/123')
    .auth("Seymour", "l3tsE4tL3aves")
    .expect(200)
    .expect({
      "success": true
    })
    .end(done)
  })
  it('should delete one day of Reynard barking', function (done) {
    request(app).delete('/api/stats/456')
    .auth("Reynard", "l3tsB4rkMor3")
    .expect(200)
    .expect({
      "success": true
    })
    .end(done)
  })
  it('Should verify there are 4 Statistics', function (done) {
    Stats.count({}).then(function(num) {
      assert.equal(num, 4);
      done();
    })
  })
})

// Delete one activity entirely
describe('DELETE /api/activity/:id', function () {
  it('should delete Reynards barking', function (done) {
    request(app).delete('/api/activity/0')
    .auth("Reynard", "l3tsB4rkMor3")
    .expect(200)
    .expect({
      "success": true
    })
    .end(done)
  })
  it('should prevent Reynards from deleting Seymours activity', function (done) {
    request(app).delete('/api/activity/1')
    .auth("Reynard", "l3tsB4rkMor3")
    .expect(401)
    .end(done)
  })
  it('Should verify there are 2 activities', function (done) {
    Activity.count({}).then(function(num) {
      assert.equal(num, 2);
      done();
    })
  })
  it('Should verify there are 2 Statistics remaining ', function (done) {
    Stats.count({}).then(function(num) {
      assert.equal(num, 2);
      done();
    })
  })
})
