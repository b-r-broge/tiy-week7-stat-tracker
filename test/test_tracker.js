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
  })
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
          "activityId": 0
        },
        {
          "activity": "sleeping",
          "activityId": 2
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
          "activityId": 1
        }
      ]
    })
    .end(done);
  })

})
