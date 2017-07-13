const assert = require("assert");
const request = require("supertest");
const app = require('../app');

const Users = require('../models/users')
const Activities = require('../models/activities')
const Stats = require('../models/stats')

describe('POST /api/signup - add a user to the database', function() {
  before('reset the test database', function(done) {
    Users.remove({}).then(function() {});
    Activities.remove({}).then(function() {});
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
// describe('GET /api/check - It should verify a correct signin', function() {
//   it('Should return that brad:test is an invalid user:pass', function(done) {
//     request(app).get('/api/check')
//     .auth("brad", "test")
//     .expect(401)
//     .expect({})
//     .end(done)
//   })
//   it('Should return that Reynard:l3tsB4rkMor3 is a valid user:pass', function(done) {
//     request(app).get('/api/check')
//       .auth({
//         "username": "Reynard",
//         "password": "l3tsB4rkMor3"
//       })
//       .expect(200)
//       .expect({
//         "success": true,
//         "username": "Reynard"
//       })
//       .end(done)
//   })
// })

// Add a new activity for a user
describe('POST /api/activity', function () {
  it('Should add an activity with a uuid to the database', function (done) {
    request(app).post('/api/activity')
    .send({
      "username": "Reynard",
      "password": "l3tsB4rkMor3",
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
  it('Should add an activity to the database', function (done) {
    request(app).post('/api/activity')
    .send({
      "username": "Seymour",
      "password": "l3tsE4tL3aves",
      "activity": "sleeping"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .expect({
      "success": true,
      "activity": "sleeping"
    })
  })
})
