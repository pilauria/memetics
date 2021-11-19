var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')

const User = require('../models/User.model')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login-form');
});

router.post('/signup-form', async (req, res)=>{
  const {username, email, password} = req.body
  // ++++++++++ comprobar que si no introducimos todos los campos no deja seguir y eliminar condicion siguiente
  // ++++++++++
  // ++++++++++
  if(!email || !password || !password) res.render('signup-form', username, email, {error: "All fields are required"})
  const user = await User.findOne(email)
  if(user) res.render('signup-form',{error: "User already exists"})
  const salt = bcrypt.genSaltSync(5)
  const hashPwd = bcrypt.hashSync(password, salt)

  const newUser = await User.create(username, password, email)
  res.render('index')
})

router.route("/login")
.get((req, res)=>{
  res.render("login-form")
})
.post( async (req, res)=>{
  const {email, password} = req.body
  const userExists = await User.findOne(email)
  if(!userExists) res.render('login-form', {error: "User not found"})
  const pwdIsCorrect = bcrypt.compareSync(password, userExists.password)
  if(pwdIsCorrect){
    //+++++++++++++++++++ falta crear session 
    res.render('index')
  }
})

module.exports = router;
