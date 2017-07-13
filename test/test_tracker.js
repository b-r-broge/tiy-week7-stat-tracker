const assert = require("assert");
const request = require("supertest");
const app = require('../app');

const Users = require('../models/users')
const Activity = require('../models/activities')
const Stats = require('../models/stats')

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
      "activity": "barking"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activity": "barking"
    })
    .end(done)
  })
  it('Should add an activity to the database - verify uuid and activityId are calculated separately', function (done) {
    request(app).post('/api/activity')
    .auth("Seymour", "l3tsE4tL3aves")
    .send({
      "activity": "sleeping"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activity": "sleeping"
    })
    .end(done)
  })
  it('Should add an activity with a uuid to the database - verify activityId is unique', function (done) {
    request(app).post('/api/activity')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "activity": "sleeping"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activity": "sleeping"
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
          "activityLink": "/api/activity/0"
        },
        {
          "activity": "sleeping",
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
          "activityLink": "/api/activity/1"
        }
      ]
    })
    .end(done);
  })
})

describe('POST /activity/:id/stats', function() {
  it('should deny modifiying an activity you don\'t own', function (done) {
    request(app).post('/api/activity/1/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "numberPerformed": 12
    })
    .expect(401)
    .end(done)
  })
  it('should deny modifiying an activity when you don\'t authorize', function (done) {
    request(app).post('/api/activity/1/stats')
    .send({
      "date": "7/11/17",
      "numberPerformed": 12
    })
    .expect(401)
    .end(done)
  })
  it('Should stop you to adding a stat for an invalid activity', function (done) {
    request(app).post('/api/activity/5/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "numberPerformed": 12
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
      "numberPerformed": 12
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "numberPerformed": 12
    })
    .end(done)
  })
  it('Should allow you to overwrite a stat you own', function (done) {
    request(app).post('/api/activity/0/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "numberPerformed": 1000
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "numberPerformed": 1000
    })
    .end(done)
  })
  it('Should allow you to add a stat to an activity you own', function (done) {
    request(app).post('/api/activity/1/stats')
    .auth("Seymour", "l3tsE4tL3aves")
    .send({
      "date": "7/11/17",
      "numberPerformed": 10
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "numberPerformed": 10
    })
    .end(done)
  })
  it('Should allow you to add a stat to an activity you own', function (done) {
    request(app).post('/api/activity/2/stats')
    .auth("Reynard", "l3tsB4rkMor3")
    .send({
      "date": "7/11/17",
      "numberPerformed": 4
    })
    .expect({
      "success": true,
      "date": "7/11/17",
      "numberPerformed": 4
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
