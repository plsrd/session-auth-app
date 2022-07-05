const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Greetings and Salutations!' });
});

router.get('/login', loginController.login_get);

module.exports = router;
