var express = require('express');
var router = express.Router();
const User = require('../models/User.model');
const Meme = require('../models/Meme.model');
const MemeApi = require('../apis/api');
const { on } = require('npmlog');
const { config } = require('dotenv');
const isLoggedIn = require('../middleware/isLoggedIn');
const { memoryStorage } = require('multer');
const { update } = require('../models/User.model');

router
  .route('/create/:id')
  .get(isLoggedIn, async (req, res) => {
    try {
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
      ///////
      const template_id = idMeme;
      const API_USER = process.env.API_USER;
      const API_PASSWORD = process.env.API_PASSWORD;
      // Determinar número de boxes
      let params = {};
      if (one.box_count < 3) {
      const text0 = "Text #1";
      const text1 = "Text #2";
      params = {
        template_id,
        username: API_USER,
        password: API_PASSWORD,
        text0,
        text1,
      };
    } else {
      params = {
        template_id: template_id,
        username: API_USER,
        password: API_PASSWORD,
      };
      
      for (let i = 1; i <= one.box_count; i++) {
        let oneText = `Text #${i}`;
        params[`boxes[${i}][text]`] = oneText; // This becomes /?boxes="boxes[0][text]" in teh url
      }
    }
    MemeApi.createMeme(params)
      .then(async el => {
        if (el.data.success) {
          const img = el.data.data.url;
          let isAuthorized = true;
          let numberOfBoxes = []
          for (let i = 1; i <= one.box_count; i++) {
            let oneText = `Text #${i} here!`;
            numberOfBoxes.push(oneText)
          }
          if (one.box_count < 3)
            res.render('meme-create', { one, isAuthorized, userName, img });
          else
            res.render('meme-create+2', {
            one,
            numberOfBoxes,
            isAuthorized,
            userName,
            img
          });
        }
      })
      .catch(err => console.log(err));

      ///////
      //const numberOfBoxes = [];
      //for (let i = 1; i <= one.box_count; i++) numberOfBoxes.push(`Box ${i}`);
      //let isAuthorized = true;
      //if (one.box_count < 3)
      //  res.render('meme-create', { one, isAuthorized, userName });
      //else
      //  res.render('meme-create+2', {
      //    one,
      //    numberOfBoxes,
      //    isAuthorized,
      //    userName,
      //  });
    //} catch (err) {
    //  console.log(err);
    }
    catch(err){
      console.log(err)
    }
  })
  .post(async (req, res) => {
    const userId = req.session.currentUser._id;
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
    const template_id = idMeme;
    const API_USER = process.env.API_USER;
    const API_PASSWORD = process.env.API_PASSWORD;
    // Determinar número de boxes
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
          const _id = newMeme._id;
          res.render('meme-result', { img, isAuthorized: true, userName, _id });
        }
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
          userName,
        });
    } catch (err) {
      console.log(err);
    }
  })
  .post(isLoggedIn, async (req, res) => {
    try {
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
          username: API_USER,
          password: API_PASSWORD,
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
  try {
    const deleteMeme = await Meme.findByIdAndDelete(req.params.id).populate(
      'owner'
    );
    const updatedUser2 = await User.find({ favourites: deleteMeme._id });

    for (let el of updatedUser2) {
      const deleted = await User.findByIdAndUpdate(
        { _id: el.id },
        { $pullAll: { favourites: [deleteMeme._id] } }
      );
    }
    res.redirect('/users/user-profile');
  } catch (error) {
    console.log(error);
  }
});

router.put('/community/:id', isLoggedIn, async (req, res) => {
  const favId = req.params.id; // id meme


  const userId = req.session.currentUser._id; // id usuario
  const user = await User.findById(userId);

  if (user.favourites.indexOf(favId) === -1) {
    const updateFav = await User.findByIdAndUpdate(userId, {
      $push: { favourites: favId },
    });
    const response = "red"
    res.json(response)
    //res.redirect('/memes/community');
  } else {
    const deleted = await User.findByIdAndUpdate(
      { _id: userId },
      { $pullAll: { favourites: [favId] } }
    );
    const response = "blank"
    res.json(response)
    //res.redirect('/memes/community');
  }
});

router.put('/liked/:id', async (req, res) => {
  const user = req.session.currentUser._id;
  const memeId = req.params.id;
  const meme = await Meme.findById(memeId);
  let valueLikes = meme.likes;
  if (!meme.likedByUser.includes(user)) {
    const liked = await Meme.findByIdAndUpdate(memeId, {
      $push: { likedByUser: user },
    });
    valueLikes += 1;
  } else {
    const notLiked = await Meme.findByIdAndUpdate(memeId, {
      $pull: { likedByUser: user },
    });
    valueLikes -= 1;
  }
  const memeLiked = await Meme.findByIdAndUpdate(
    memeId,
    { likes: valueLikes },
    { new: true }
  );
  res.json(memeLiked);
});

router.get('/community', async (req, res) => {
  const getAll = await Meme.find().populate('owner').lean();
  if (req.session.currentUser) {
    const userid = req.session.currentUser._id;
    const user = await User.findById(userid);

    for (let memes of getAll) {
      if (user.favourites) {
        if (user.favourites.includes(memes._id)) {
          memes['checked'] = true;
        }
      }
    }
    req.session.favourites = getAll;

    let userName = req.session.currentUser.username.charAt(0).toUpperCase();
    const isAuthorized = req.session.currentUser ? true : false;
    res.render('meme-finished', { isAuthorized, userid, getAll, userName });
  } else res.render('meme-finished', { getAll });
});

router.get('/', async (req, res, next) => {
  try {
    const getMemes = await MemeApi.getAll();
    const allMemes = getMemes.data.data.memes;
    const isAuthorized = req.session.currentUser ? true : false;
    if (isAuthorized === true) {
      let userName = req.session.currentUser.username.charAt(0).toUpperCase();
      res.render('meme-list', { allMemes, isAuthorized, userName });
    } else {
      res.render('meme-list', { allMemes, isAuthorized });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;