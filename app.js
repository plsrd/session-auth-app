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

const validPassword = (password, hash, salt) => {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  console.log(hash, hashVerify);
  return hash === hashVerify;
};

const genPassword = password => {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');

  return {
    salt,
    hash: genHash,
  };
};

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

app.use('/', indexRouter);

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success',
  }),
  (req, res, next) => {
    if (err) return next(err);
  }
);
// When you visit http://localhost:3000/register, you will see "Register Page"
app.get('/register', (req, res, next) => {
  const form =
    '<h1>Register Page</h1><form method="post" action="register">\
                  Enter Username:<br><input type="text" name="username">\
                  <br>Enter Password:<br><input type="password" name="password">\
                  <br><br><input type="submit" value="Submit"></form>';
  res.send(form);
});

app.post('/register', (req, res, next) => {
  const saltHash = genPassword(req.body.password);

  const { salt, hash } = saltHash;

  new User({
    username: req.body.username,
    salt,
    hash,
  }).save((err, user) => {
    if (err) return next(err);
    console.log('New user', user);
    res.redirect('/login');
  });
});

app.get('/protected-route', (req, res, next) => {
  console.log(req.session);

  if (req.isAuthenticated()) {
    res.send('<h1>You are authenticated</h1>');
  } else {
    res.send('<h1>You are not authenticated</h1>');
  }
});

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

app.get('/login-failure', (req, res, next) => {
  res.send('You entered the wrong password.');
});

app.listen(3000);
