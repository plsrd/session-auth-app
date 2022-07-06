const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const User = require('../models/user');

exports.login_get = (req, res, next) => {
  res.render('user-form', { title: 'Log In', action: '/login' });
};

exports.login_post = passport.authenticate('local', {
  failureRedirect: '/login-failure',
  successRedirect: '/protected-content',
});

exports.register_get = (req, res, next) => {
  res.render('user-form', { title: 'Register', action: '/register' });
};

exports.register_post = (req, res, next) => {
  const saltHash = genPassword(req.body.password);

  const { salt, hash } = saltHash;

  new User({
    username: req.body.username,
    salt,
    hash,
  }).save((err, user) => {
    if (err) return next(err);

    res.redirect('/login');
  });
};

exports.protected_content_get = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('protected-content');
  } else {
    res.redirect('/login');
  }
};

exports.logout_get = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
};
