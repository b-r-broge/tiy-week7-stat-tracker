const assert = require("assert");
const request = require("supertest");
const app = require('../app');

const Users = require('../models/users')
const Activities = require('../models/activities')
const Stats = require('../models/stats')

describe('POST /api/signup', function() {
  before('reset the test database', function(done) {
    Users.remove({}).then(function() {});
    Activities.remove({}).then(function() {});
    Stats.remove({}).then(function() {});

    setTimeout(function() {
      return done();
    }, 500);
  })

  it('Should add user "Reynard" to the users database', function(done) {
    request(app).post('/api/signup')
      .send({
        "username": "Reynard",
        "password": "l3tsB4rkMor3"
      })
      .expect(200)
      .expect({
        "success": true,
        "newUsername": "Reynard"
      })
      .end(done)
  })
})
