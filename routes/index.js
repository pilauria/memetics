var express = require('express');
var router = express.Router();

const User = require('../models/User.model');
const Api = require('../apis/api');

/* GET home page. */
router.get('/', (req, res) => {
  const isAuthorized = req.session.currentUser ? true : false;
  let userName = req.session.currentUser.username.charAt(0).toUpperCase();
  console.log(userName);
  User.find().then(users =>
    res.render('index', { users, isAuthorized, userName })
  );
});

/* GET from API */
router.get('/api', (req, res) => {
  Api.getAll().then(entity =>
    res.render('index', { title: 'Express', users: entity })
  );
});

module.exports = router;
