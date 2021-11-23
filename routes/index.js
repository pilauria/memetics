var express = require('express');
var router = express.Router();

const User = require('../models/User.model');
const Api = require('../apis/api');

/* GET home page. */
router.get('/', (req, res) => {
  const isAutorized = req.session.currentUser ? true : false;

  User.find().then(users => res.render('index', { users, isAutorized }));
});

/* GET from API */
router.get('/api', (req, res) => {
  Api.getAll().then(entity =>
    res.render('index', { title: 'Express', users: entity })
  );
});

module.exports = router;
