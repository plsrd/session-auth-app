const passport = require('passport');

exports.login_get = (req, res, next) => {
  res.render('login', { title: 'Log In' });
};

exports.login_post = passport.authenticate('local', {
  failureRedirect: '/login-failure',
  successRedirect: '/login-success',
});
