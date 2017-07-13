const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || "dev";
const config = require('./config/config.json')[env]

const app = express();
app.use(bodyParser.json());

const authRoute = require('./routes/auth');

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongoUrl);

app.use('/api', authRoute);

app.set('port', (process.env.PORT || 3000));
if (require.main === module) {
  app.listen(app.get('port'), function () {
    console.log("Server running at http://localhost:3000")
  })
}

module.exports = app;
