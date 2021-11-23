var express = require('express');
var router = express.Router();
const User = require('../models/User.model');
const Meme = require('../models/Meme.model');
const MemeApi = require('../apis/api');
const { on } = require('npmlog');
const { config } = require('dotenv');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/', async (req, res, next) => {
  const getMemes = await MemeApi.getAll();
  const allMemes = getMemes.data.data.memes;
  res.render('meme-list', { allMemes });
});

router
  .route('/create/:id', isLoggedIn)
  .get(async (req, res) => {
    try {
      const idMeme = req.params.id;
      const getMemes = await MemeApi.getAll();
      const allMemes = getMemes.data.data.memes;
      let index = null;
      for (let el of allMemes) {
        if (el.id === idMeme) {
          index = allMemes.indexOf(el);
        }
      }
      const one = allMemes[index];

      const numberOfBoxes = [];
      for (let i = 1; i <= one.box_count; i++) numberOfBoxes.push(`Box ${i}`);
      if (one.box_count < 3) res.render('meme-create', one);
      else res.render('meme-create+2', { one, numberOfBoxes });
    } catch (err) {
      console.log(err);
    }
  })
  .post(async (req, res) => {
    const userId = req.session.currentUser._id;
    console.log('session', userId);
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
    const username = 'bering20';
    const password = 'ironhack';
    let params = {};
    if (oneMeme.box_count < 3) {
      const { text0, text1 } = req.body;
      params = { template_id, username, password, text0, text1 };
      totalText.push(text0);
      totalText.push(text1);
    } else {
      params = {
        template_id: template_id,
        username: username,
        password: password,
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
          console.log(
            oneMeme.name,
            img,
            oneMeme.width,
            oneMeme.height,
            oneMeme.box_count,
            totalText
          );
          const newMeme = await Meme.create({
            name: oneMeme.name,
            url: img,
            width: oneMeme.width,
            height: oneMeme.height,
            box_count: oneMeme.box_count,
            text: totalText,
            owner: userId,
          });
          res.render('meme-result', { img });
        }
        //else{()}
      })
      .catch(err => console.log(err));
  });

//router.route('/update/:id')
//.get( async (req, res)=>{
//  try{
//    const idMeme = req.params.id;
//    let index = null;
//    for (let el of allMemes) {
//      if (el.id === idMeme) {
//        index = allMemes.indexOf(el);
//      }
//    }
//    const one = allMemes[index];
//    const numberOfBoxes = []
//    for(let i=1; i<=one.box_count; i++) numberOfBoxes.push(`text${i}`)
//    if(one.box_count < 3) res.render('meme-update', one);
//    else res.render('meme-update+2', {one, numberOfBoxes})
//
//  }
//  catch(err){
//    console.log(err)
//  }
//})
//.post((req, res) => {
//  const id = req.params.id;
//  const { text0, text1 } = req.body;
//  const template_id = id;
//  // ++++++++++++++++++++++++ Pietro, incluir en .env usuario y contraseña y cambiar aquí
//  const username = 'bering20';
//  const password = 'ironhack';
//  const params = { template_id, username, password, text0, text1 };
//  // ++++++++++++++ Una vez tengamos la base de datos operando, recuperar los datos actuales de texto y pasarlos para mostrarlos en pantalla como default value
//  MemeApi.createMeme(params)
//    .then(el => {
//      const img = el.data.data.url
//      res.render('meme-result', {img})
//    })
//    .catch(error => console.log(error));
//});

module.exports = router;
