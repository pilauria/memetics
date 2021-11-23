var express = require('express');
var router = express.Router();
const User = require('../models/User.model');
const Meme = require('../models/Meme.model');
const MemeApi = require('../apis/api');
const { on } = require('npmlog');
const { config } = require('dotenv');
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/', async (req, res, next) => {
  const getMemes = await MemeApi.getAll();
  const allMemes = getMemes.data.data.memes;
  const isAuthorized = req.session.currentUser ? true : false;
  res.render('meme-list', { allMemes, isAuthorized });
});

router

  .route('/create/:id')
  .get(isLoggedIn, async (req, res) => {
    
   try {
      console.log('session current user', req.session.currentUser);
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

     const numberOfBoxes = []
      for(let i=1; i<=one.box_count; i++) numberOfBoxes.push(`Box ${i}`)
      let isAuthorized = true
      console.log("sdadadaddasdsdsdadas",isAuthorized)
      if(one.box_count < 3) res.render('meme-create', {one, isAuthorized});
      else res.render('meme-create+2', {one, numberOfBoxes, isAuthorized})

    } catch (err) {
      console.log(err);
    }
  })

  .post(async (req, res) => {
    const userId = req.session.currentUser._id  
    console.log("session", userId)

    const idMeme = req.params.id;
    const getMemes = await MemeApi.getAll();
    const allMemes = getMemes.data.data.memes;
    const totalText = []
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
    const API_USER = "bering20"
    const API_PASSWORD = "ironhack"
    let params = {}
    if(oneMeme.box_count <3){
      const { text0, text1 } = req.body;
      params = { template_id, username: API_USER, password: API_PASSWORD, text0, text1 };
      totalText.push(text0)
      totalText.push(text1)
    }else{
      params = { 
        "template_id": template_id, 
        "username": API_USER, 
        "password": API_PASSWORD
      };
    
      for(let i=0; i<oneMeme.box_count;i++){
        let oneText = req.body.text[i];
        params[`boxes[${i}][text]`] = oneText; // This becomes /?boxes="boxes[0][text]" in teh url
        totalText.push(oneText)
      }
    }

    MemeApi.createMeme(params)
      .then(async (el) => {
        if(el.data.success){
        const img = el.data.data.url
        const newMeme = await Meme.create({name: oneMeme.name, url: img, width: oneMeme.width, height: oneMeme.height, box_count : oneMeme.box_count, text: totalText, owner: userId, template: oneMeme.id })
        res.render('meme-result', {img, isAuthorized: true})
      }
      //else{()}
      })
      .catch(err=>console.log(err));
  });

  router
  .route('/update/:id', isLoggedIn)
  .get(async (req, res) => {
    try {
      const idMeme = req.params.id;
      const getMemes = await MemeApi.getAll();
      const allMemes = getMemes.data.data.memes;
      const memeToBeUpdated = await Meme.findById(idMeme)
      const numberOfBoxes = [];
      for (let i = 1; i <= memeToBeUpdated.box_count; i++) numberOfBoxes.push(`Box ${i}`);
      let isAuthorized = true
      if (memeToBeUpdated.box_count < 3) res.render('meme-update', {memeToBeUpdated, isAuthorized});
      else res.render('meme-update+2', {memeToBeUpdated, numberOfBoxes, isAuthorized})
    } catch (err) {
      console.log(err); 
    }
  })
  .post(async (req, res) => {
    try{
      //const userId = req.session.currentUser._id;
    //console.log('session', userId);
    const idMeme = req.params.id;
    const memeToBeUpdated = await Meme.findById(idMeme);
    const totalText = []
    const numOfBoxes = memeToBeUpdated.box_count
    const API_USER = process.env.API_USER;
    const API_PASSWORD = process.env.API_PASSWORD;
    const template_id = memeToBeUpdated.template

    if(numOfBoxes <3 ) {
        const { text0, text1 } = req.body;
        params = { template_id: template_id, username: "bering20", password: "ironhack", text0: text0, text1: text1 };
        totalText.push(text0);
        totalText.push(text1);
    } else {  
        params = {
        template_id: template_id,
        username: "bering20",
        password: "ironhack",
      }
    
    for (let i = 0; i < memeToBeUpdated.box_count; i++) {
        let oneText = req.body.text[i];
        params[`boxes[${i}][text]`] = oneText; // This becomes /?boxes="boxes[0][text]" in the url
        totalText.push(oneText);
    }
  }
  MemeApi.createMeme(params)
  .then( async el => {
        if (el.data.success) {
          const img = el.data.data.url;

          console.log(idMeme)
          const newMeme = await Meme.findOneAndUpdate({_id:idMeme}, { url: img, text: totalText }, {upsert: true});
          res.render('meme-result', { img });

        }
        else{}
      })
      .catch(err => console.log(err));
    }catch(err){
      console.log(err)
    }
    

});

router.get('/delete/:id', async (req, res)=>{
  const deleteMeme = await Meme.findByIdAndDelete({_id: req.params.id})
  res.redirect('/users/user-profile')
})

  
module.exports = router;
