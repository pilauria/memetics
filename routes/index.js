var express = require('express');
var router = express.Router();

const User = require('../models/User.model');

/* GET home page. */
router.get('/', (req, res) => {
  const isAuthorized = req.session.currentUser ? true : false;
  if (isAuthorized === true) {
    let userName = req.session.currentUser.username.charAt(0).toUpperCase();
    User.find().then(users =>
      res.render('index', { users, isAuthorized, userName })
    );
  } else {
    User.find().then(users => res.render('index', { users, isAuthorized }));
  }
});

module.exports = router;
