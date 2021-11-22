var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const isLoggedIn = require('../middleware/isLoggedIn.js');
const isNotLoggedIn = require('../middleware/isNotLoggedIn.js');

const User = require('../models/User.model');
const Meme = require('../models/Meme.model')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('login-form');
});

// ----- SIGN UP ------- //
// GET route ==> to display the signup form to users
router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('signup-form');
});

// POST route ==> to process form data
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // make sure users fill all mandatory fields:
    if (!username || !email || !password) {
      res.render('signup-form', {
        message: 'All fields are required!',
      });
    }

    // make sure passwords are strong:
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      res.status(500).render('signup-form', {
        errorMessage:
          'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.',
      });
      return;
    }

    const salt = bcrypt.genSaltSync(5);
    const hashPwd = bcrypt.hashSync(password, salt);
    const newUser = await User.create({ username, password: hashPwd, email });
    res.render('index', { message: 'User created!!', user: username });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render('signup-form', { errorMessage: error.message });
      console.log(error.message);
      // Make sure data in the database is clean - no duplicates
    } else if (error.code === 11000) {
      res.status(500).render('signup-form', {
        errorMessage:
          'Username and email need to be unique. Either username or email is already used.',
      });
    } else {
      next(error);
    }
  }
});

// ------ LOGIN ------ //
router
  .route('/login', isNotLoggedIn)
  .get((req, res) => {
    res.render('login-form');
  })
  .post(async (req, res, next) => {
    console.log('SESSION =====> ', req.session);
    try {
      const { email, password } = req.body;
      if (email === '' || password === '') {
        res.render('login-form', {
          errorMessage: 'Please enter both, email and password to login.',
        });
        return;
      }

      const userExists = await User.findOne({ email }); //// <== check if there's user with the provided email
      if (!userExists) {
        res.render('login-form', {
          errorMessage: 'Email is not registered. Try with other email.',
        });
        return;
        // if there's a user, compare provided password
        // with the hashed password saved in the database
      } else if (bcrypt.compareSync(password, userExists.password)) {
        //******* SAVE THE USER IN THE SESSION ********//
        req.session.currentUser = userExists;
        res.redirect('user-profile');
      } else {
        // if the two passwords DON'T match, render the login form again
        // and send the error message to the user
        res.render('login-form', { errorMessage: 'Incorrect password.' });
      }
    } catch (error) {
      next(error);
    }
  });

router.get('/user-profile', isLoggedIn, async (req, res) => {
  const userId = req.session.currentUser._id;
  console.log(userId)
  const findMemes = await Meme.find({owner: userId}).populate('owner')
  console.log("sddsadsdsadsadasdsdsdsadasdasdasdad", findMemes)
  res.render('user-profile', {
    userInSession: req.session.currentUser,
    findMemes
  });
});

router.post('/logout', isLoggedIn, (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
