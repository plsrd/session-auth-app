const express = require('express');
const mongoose = require('mongoose');
var createError = require('http-errors');
var path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const validPassword = require('./lib/passwordUtils').validPassword;

const User = require('./models/user');

const indexRouter = require('./routes/index');
// const loginRouter = require('./routes/login')

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const sessionStore = new MongoStore({
  mongoUrl: process.env.MONGO_DB_URI,
  collectionName: 'sessions',
});

// app.use('/login', loginRouter)

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 30,
    },
  })
);

passport.use(
  new LocalStrategy((username, password, cb) => {
    User.findOne({ username })
      .then(user => {
        if (!user) return cb(null, false);

        const isValid = validPassword(password, user.hash, user.salt);

        if (isValid) {
          return cb(null, user);
        } else {
          return cb(null, false);
        }
      })
      .catch(err => cb(err));
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);

app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

app.get('/login-success', (req, res, next) => {
  console.log(req.session);
  res.send('You successfully logged in.');
});

app.listen(3000);
