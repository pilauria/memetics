var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log('req.session.loggedinUser: ', req.session.loggedinUser);
  res.render('index', { title: 'Ovelles Negres' });
});

module.exports = router;
