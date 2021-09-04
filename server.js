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
  log: [],
  _id: {
    type: String,
    required: true,
  },
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

const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
