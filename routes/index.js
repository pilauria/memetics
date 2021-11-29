var express = require('express');
var router = express.Router();

const MemeApi = require('../apis/api');
const User = require('../models/User.model');

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    console.log(req.session.currentUser)
    const getMemes = await MemeApi.getAll();
    const allMemes = getMemes.data.data.memes;
    const fewMemes = allMemes.filter(meme => meme.height < 380);
    const isAuthorized = req.session.currentUser ? true : false;
    if (isAuthorized === true) {
      let userName = req.session.currentUser.username.charAt(0).toUpperCase();
      User.find().then(users => {
        res.render('index', { users, isAuthorized, userName, fewMemes });
      });
    } else {
      User.find().then(users =>
        res.render('index', { users, isAuthorized, fewMemes })
      );
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
