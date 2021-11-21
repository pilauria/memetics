var express = require('express');
var router = express.Router();
const User = require('../models/User.model');
const Meme = require('../models/Meme.model');
const MemeApi = require('../apis/api');

router.get('/', async (req, res, next) => {
  const getMemes = await MemeApi.getAll();
  const allMemes = getMemes.data.data.memes;
  //console.log(allMemes);
  res.render('meme-list', { allMemes });
});

router
  .route('/create/:id')
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

      res.render('meme-create', one);
    } catch (err) {
      console.log(err);
    }
  })
  .post((req, res) => {
    const id = req.params.id;
    const { text0, text1 } = req.body;
    const template_id = id;
    const username = 'bering20';
    const password = 'ironhack';
    const params = { template_id, username, password, text0, text1 };
    console.log(text0, text1);
    MemeApi.createMeme(params)
      .then(el => console.log(el))
      .catch(error => console.log(error));
  });

module.exports = router;
