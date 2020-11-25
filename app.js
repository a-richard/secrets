require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const { SECRET } = process.env;
userSchema.plugin(encrypt, { secret: SECRET, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ email: username }, (err, foundUser) => {
    if (err) console.log(err);
    else if (foundUser) {
      if (foundUser.password === password) res.render('secrets');
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  newUser.save((err) => {
    if (err) console.log(err);
    else res.render('secrets');
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App is running on port ${process.env.PORT || 3000}`);
});
