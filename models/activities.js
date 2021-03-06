const mongoose = require('mongoose');
const Schema = mongoose.Schema

const activitySchema = new Schema({
  activityName: {
    type: String,
    required: true
  },
  activityMetric: {
    type: String,
    required: true
  },
  activityId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true
  }
})

const Activities = mongoose.model('Activities', activitySchema)

module.exports = Activities;
