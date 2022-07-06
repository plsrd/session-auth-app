const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Greetings and Salutations!' });
});

router.get('/login', userController.login_get);

router.post('/login', userController.login_post);

router.get('/login-failure', userController.login_failure);

router.get('/register', userController.register_get);

router.post('/register', userController.register_post);

router.get('/protected-content', userController.protected_content_get);

router.get('/logout', userController.logout_get);

module.exports = router;
