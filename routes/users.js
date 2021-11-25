var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const isLoggedIn = require('../middleware/isLoggedIn.js');
const isNotLoggedIn = require('../middleware/isNotLoggedIn.js');

const User = require('../models/User.model');
const Meme = require('../models/Meme.model');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('login-form');
});

// ----- SIGN UP ------- //
// GET route ==> to display the signup form to users
router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('signup-form');
});

// POST route ==> to process form data
router.post('/signup', async (req, res, next) => {
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
    req.session.currentUser = newUser;
    console.log(newUser)
    res.redirect('/')
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
    // console.log('SESSION =====> ', req.session);
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
        //res.redirect('/users/user-profile');
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
  try {
    const userId = req.session.currentUser._id;
    let userName = req.session.currentUser.username.charAt(0).toUpperCase();
    const findMemes = await Meme.find({ owner: userId }).populate('owner');

    res.render('user-profile', {
      userInSession: req.session.currentUser,
      findMemes,
      isAuthorized: true,
      userName,
      userId,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/delete-user/:id', async (req, res) => {
  try {
    //get user id from url
    const userId = req.params.id;
    // buscar el usuario a eliminar por id y eliminarlo
    const deleteUser = await User.findByIdAndDelete(userId);
    // Buscamos todos los memes que tienen como owner el usuario eleiminado
    const memeCreatedByDeletedUser = await Meme.find({ owner: userId });
    // hacemos loop entre el array memeCreatedByDeletedUser y eliminamos cada meme por su id
    // también creamos un array updateUser con los usuarios que tienen entre favourites el id del meme borrado
    for (let el of memeCreatedByDeletedUser) {
      const deleteMeme = await Meme.findByIdAndDelete(el._id);
      const updatedUser = await User.find({ favourites: el._id });
      // por último eliminamos el id del meme dentro de cada favourites de cada usuario
      for (let el of updatedUser) {
        const deleted = await User.findByIdAndUpdate(
          { _id: el.id },
          { $pullAll: { favourites: [deleteMeme._id] } }
        );
      }
    }
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});

router.post('/logout', isLoggedIn, (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
