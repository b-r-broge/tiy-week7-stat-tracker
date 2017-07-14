const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statsSchema = new Schema({
  date: {
    type: String,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  activityId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true
  },
  statId: {
    type: String,
    required: true
  }
})

const Stats = mongoose.model('Stats', statsSchema, 'statistics');

module.exports = Stats
