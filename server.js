const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const LogsSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
  user: String,
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const LOG = mongoose.model('LOGS', LogsSchema);
const USER = mongoose.model('USERS', UserSchema);

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false' }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Endpoints
app.post('/api/users', (req, res, next) => {
  const { username } = req.body;

  USER.create({ username }, (err, data) => {
    if (err) return next(err);
    console.log(data);
    res.json({ _id: data._id, username: data.username });
  });
});

app.get('/api/users', (req, res, next) => {
  USER.find({})
    .select({ __v: 0 })
    .exec((err, data) => {
      if (err) return next(err);

      res.json(data);
    });
});

app.post('/api/users/:_id/exercises', (req, res, next) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;

  USER.findById(_id, (err, data) => {
    if (err) return next(err);

    const username = data.username;
    const newDate = date
      ? new Date(date).toDateString()
      : new Date().toDateString();

    LOG.create(
      { user: _id, description, duration, date: newDate },
      (err, data) => {
        if (err) return next(err);

        res.json({
          _id,
          username,
          description,
          duration: Number(duration),
          date: data.date,
        });
      }
    );
  });
});

app.get('/api/users/:_id/logs', (req, res, next) => {
  const { _id } = req.params;

  USER.findById(_id, (err, data) => {
    if (err) return next(err);

    const username = data.username;

    LOG.find({ user: _id }, (err, data) => {
      if (err) return next(err);

      res.json({ _id, count: data.length, username });
    });
  });
});

const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
