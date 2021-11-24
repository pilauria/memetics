var express = require('express');
var router = express.Router();
const User = require('../models/User.model');
const Meme = require('../models/Meme.model');
const MemeApi = require('../apis/api');
const { on } = require('npmlog');
const { config } = require('dotenv');
const isLoggedIn = require('../middleware/isLoggedIn');
const { memoryStorage } = require('multer');

router.get('/', async (req, res, next) => {
  const getMemes = await MemeApi.getAll();
  const allMemes = getMemes.data.data.memes;
  const isAuthorized = req.session.currentUser ? true : false;
  if (isAuthorized === true) {
    let userName = req.session.currentUser.username.charAt(0).toUpperCase();
    res.render('meme-list', { allMemes, isAuthorized, userName });
  } else {
    res.render('meme-list', { allMemes, isAuthorized });
  }
});

router
  .route('/create/:id')
  .get(isLoggedIn, async (req, res) => {
    try {
      console.log('session current user', req.session.currentUser);
      const idMeme = req.params.id;
      const getMemes = await MemeApi.getAll();
      const allMemes = getMemes.data.data.memes;
      let userName = req.session.currentUser.username.charAt(0).toUpperCase();
      let index = null;
      for (let el of allMemes) {
        if (el.id === idMeme) {
          index = allMemes.indexOf(el);
        }
      }
      const one = allMemes[index];

      const numberOfBoxes = [];
      for (let i = 1; i <= one.box_count; i++) numberOfBoxes.push(`Box ${i}`);
      let isAuthorized = true;
      if (one.box_count < 3)
        res.render('meme-create', { one, isAuthorized, userName });
      else
        res.render('meme-create+2', {
          one,
          numberOfBoxes,
          isAuthorized,
          userName,
        });
    } catch (err) {
      console.log(err);
    }
  })
  .post(async (req, res) => {
    const userId = req.session.currentUser._id;
    console.log('session', userId);
    let userName = req.session.currentUser.username.charAt(0).toUpperCase();
    const idMeme = req.params.id;
    const getMemes = await MemeApi.getAll();
    const allMemes = getMemes.data.data.memes;
    const totalText = [];
    // Refactor using .indexOf() or .find()
    let index = null;
    for (let el of allMemes) {
      if (el.id === idMeme) {
        index = allMemes.indexOf(el);
      }
    }
    const oneMeme = allMemes[index];
    // Determinar número de boxes
    const template_id = idMeme;
    // ++++++++++++++++++++++++ Pietro, incluir en .env usuario y contraseña y cambiar aquí
    const API_USER = 'bering20';
    const API_PASSWORD = 'ironhack';
    let params = {};
    if (oneMeme.box_count < 3) {
      const { text0, text1 } = req.body;
      params = {
        template_id,
        username: API_USER,
        password: API_PASSWORD,
        text0,
        text1,
      };
      totalText.push(text0);
      totalText.push(text1);
    } else {
      params = {
        template_id: template_id,
        username: API_USER,
        password: API_PASSWORD,
      };

      for (let i = 0; i < oneMeme.box_count; i++) {
        let oneText = req.body.text[i];
        params[`boxes[${i}][text]`] = oneText; // This becomes /?boxes="boxes[0][text]" in teh url
        totalText.push(oneText);
      }
    }

    MemeApi.createMeme(params)
      .then(async el => {
        if (el.data.success) {
          const img = el.data.data.url;
          const newMeme = await Meme.create({
            name: oneMeme.name,
            url: img,
            width: oneMeme.width,
            height: oneMeme.height,
            box_count: oneMeme.box_count,
            text: totalText,
            owner: userId,
            template: oneMeme.id,
          });
          res.render('meme-result', { img, isAuthorized: true, userName });
        }
        //else{()}
      })
      .catch(err => console.log(err));
  });

router
  .route('/update/:id')
  .get(isLoggedIn, async (req, res) => {
    try {
      const idMeme = req.params.id;
      const getMemes = await MemeApi.getAll();
      const allMemes = getMemes.data.data.memes;
      let userName = req.session.currentUser.username.charAt(0).toUpperCase();
      const memeToBeUpdated = await Meme.findById(idMeme);
      const numberOfBoxes = [];
      for (let i = 1; i <= memeToBeUpdated.box_count; i++)
        numberOfBoxes.push(`Box ${i}`);
      let isAuthorized = true;
      if (memeToBeUpdated.box_count < 3)
        res.render('meme-update', { memeToBeUpdated, isAuthorized, userName });
      else
        res.render('meme-update+2', {
          memeToBeUpdated,
          numberOfBoxes,
          isAuthorized,
        });
    } catch (err) {
      console.log(err);
    }
  })
  .post(isLoggedIn, async (req, res) => {
    try {
      //const userId = req.session.currentUser._id;
      //console.log('session', userId);
      const idMeme = req.params.id;
      const memeToBeUpdated = await Meme.findById(idMeme);
      const totalText = [];
      let userName = req.session.currentUser.username.charAt(0).toUpperCase();
      const numOfBoxes = memeToBeUpdated.box_count;
      const API_USER = process.env.API_USER;
      const API_PASSWORD = process.env.API_PASSWORD;
      const template_id = memeToBeUpdated.template;

      if (numOfBoxes < 3) {
        const { text0, text1 } = req.body;
        params = {
          template_id: template_id,
          username: 'bering20',
          password: 'ironhack',
          text0: text0,
          text1: text1,
        };
        totalText.push(text0);
        totalText.push(text1);
      } else {
        params = {
          template_id: template_id,
          username: 'bering20',
          password: 'ironhack',
        };

        for (let i = 0; i < memeToBeUpdated.box_count; i++) {
          let oneText = req.body.text[i];
          params[`boxes[${i}][text]`] = oneText; // This becomes /?boxes="boxes[0][text]" in the url
          totalText.push(oneText);
        }
      }
      MemeApi.createMeme(params)
        .then(async el => {
          let isAuthorized = true;
          if (el.data.success) {
            const img = el.data.data.url;
            const newMeme = await Meme.findOneAndUpdate(
              { _id: idMeme },
              { url: img, text: totalText },
              { upsert: true }
            );
            res.render('meme-result', { img, userName, isAuthorized });
          } else {
          }
        })
        .catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  });

router.get('/delete/:id', async (req, res) => {
  const deleteMeme = await Meme.findByIdAndDelete(req.params.id).populate(
    'owner'
  );
  console.log('@@@@@@@@@@@@', deleteMeme);
  const updatedUser = await User.findByIdAndUpdate(
    deleteMeme.owner._id,
    { $pull: { 'owner.favourites': deleteMeme._id } },
    { new: true }
  );
  console.log('---------->', updatedUser);
  res.redirect('/users/user-profile');
});

router.get('/finished/:id', async (req, res) => {
  const favId = req.params.id; // id meme
  const getAll = await Meme.find().populate('owner');

  const userId = req.session.currentUser._id; // id usuario
  const user = await User.findById(userId);
  const userName = req.session.currentUser.username;
  console.log(userName);

  if (user.favourites.indexOf(favId) === -1) {
    const updateFav = await User.findByIdAndUpdate(userId, {
      $push: { favourites: favId },
    });
    res.redirect('/memes/finished');
  } else {
    console.log('hello');
    res.render('meme-finished', {
      getAll,
      userName,
      favId,
      data: 'Already in favourites',
    });
  }
});

router.get('/finished', isLoggedIn, async (req, res) => {
  const getAll = await Meme.find().populate('owner').lean();
  const userid = req.session.currentUser._id;
  const user = await User.findById(userid);
  // const newAll = [...getAll]
  console.log('=====>', getAll);
  //console.log("userfav",user)
  const newArr = getAll.map(memes => {
    if (user.favourites.includes(memes._id)) {
      memes['checked'] = 'yo';
    } else {
      memes['checked'] = 'no';
    }
    return memes;
  });

  console.log('adkljdsadsadas', newArr);

  let userName = req.session.currentUser.username.charAt(0).toUpperCase();
  const isAuthorized = req.session.currentUser ? true : false;
  res.render('meme-finished', { getAll, isAuthorized, userName });
});

router.get('/finished', async (req, res) => {
  const getAll = await Meme.find().populate('owner');
  console.log(getAll);
  res.render('meme-finished', { getAll });
});

router.get('/', async (req, res, next) => {
  const getMemes = await MemeApi.getAll();
  const allMemes = getMemes.data.data.memes;
  const isAuthorized = req.session.currentUser ? true : false;
  res.render('meme-list', { allMemes, isAuthorized });
});

module.exports = router;
