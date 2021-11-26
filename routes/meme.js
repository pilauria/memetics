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

// ruta /memes --> muestra listado templates de la api
router.get('/', async (req, res, next) => {
  try {
    // llamada a la api 
    const getMemes = await MemeApi.getAll();
    // acceder dentro del objeto que devuelve la api hasta llegar al array de templates
    const allMemes = getMemes.data.data.memes;
    // comprobar si existe currentUser para cargar boton de profile con letra en nav
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

// ruta para crear un meme 
router
  .route('/create/:id')
  .get(isLoggedIn, async (req, res) => {
    try {
      // recogemos el id del meme que hemos por la url
      const idMeme = req.params.id;
      // llamada a la api y navegamos dentro del objeto hasta llegar al array de templates
      const getMemes = await MemeApi.getAll();
      const allMemes = getMemes.data.data.memes;
      let userName = req.session.currentUser.username.charAt(0).toUpperCase();
      let index = null;
      // loop dentro del array de memes templates
      for (let el of allMemes) {
        // si el id del template actual es igual al id del template que ha elegido el usuario, guardamos su indice
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
    // Preparamos las variables que nos pide la api para crear un meme
    const template_id = idMeme;
    const API_USER = process.env.API_USER;
    const API_PASSWORD = process.env.API_PASSWORD;
    // Determinar número de boxes
    let params = {};
    // params es la variable que pasamos a la api. En este caso para 2 textos
    if (oneMeme.box_count < 3) {
      //cogemos los textos del formulario 
      const { text0, text1 } = req.body;
      //creamos el objeto que nos pide la api para crear el meme
      params = {
        template_id,
        username: API_USER,
        password: API_PASSWORD,
        text0,
        text1,
      };
      // Preparamos un array con los textos para guardarlos en la base de datos y poder usarlos en update
      totalText.push(text0);
      totalText.push(text1);
    } else {
      // Preparamos array para el caso de mas de 2 cajas de texto
      params = {
        template_id: template_id,
        username: API_USER,
        password: API_PASSWORD,
      };
      // en el caso de los textos hay que crear un array que se llame boxes y pasar la información EXACTAMENTE 
      // como quiere la api. Y la api quiere que sea siguiendo el formato boxes[0]=texto, boxes[1]= texto etc
      // Utilizamos el valor de i para asignar cada posición del array y a su vez coger el valor i de req.body que 
      // corresponde a cada caja de texto rellenada por el usuario
      for (let i = 0; i < oneMeme.box_count; i++) {
        let oneText = req.body.text[i];
        params[`boxes[${i}][text]`] = oneText; // This becomes /?boxes="boxes[0][text]" in the url
        //añadimos textos para guardar en base de datos y utilizar en update
        totalText.push(oneText);
      }
    }
    //llamada a la api pasando parametros para crear meme
    MemeApi.createMeme(params)
      .then(async el => {
        // si en la respuesta de la api tenemos la url de la imagen, la guardamos en una variable
        if (el.data.success) {
          const img = el.data.data.url;
          // creamos meme en base de datos
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
          // render del meme acabado
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
      // buscamos el meme con el id que hemos pasado por la url y mismo procedimiento que para crear
      const memeToBeUpdated = await Meme.findById(idMeme);
      //recuperamos array texto anterior 
      const prevText = memeToBeUpdated.text
      // en el caso de dos textos los guardamos en dos variables
      const text0 = prevText[0]
      const text1 = prevText[1]
      const numberOfBoxes = [];
      for (let i = 1; i <= memeToBeUpdated.box_count; i++)
        numberOfBoxes.push(`Box ${i}`);
      let isAuthorized = true;
      if (memeToBeUpdated.box_count < 3)
        res.render('meme-update', { memeToBeUpdated, isAuthorized, userName, text0, text1 });
      else
        res.render('meme-update+2', {
          memeToBeUpdated,
          numberOfBoxes,
          isAuthorized,
          userName
        });
    } catch (err) {
      console.log(err);
    }
  })
  // repetimos el proceso de crear meme pero con datos actualizados
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
// ruta para borrar un meme
router.get('/delete/:id', async (req, res) => {
  try {
    // eliminamos el meme buscando por su id
    const deleteMeme = await Meme.findByIdAndDelete(req.params.id).populate(
      'owner'
    );
    //Buscamos los usuarios que tienen en favourites el meme borrado 
    const updatedUser2 = await User.find({ favourites: deleteMeme._id });
    //Hacemos loop entre los usuarios que tienen el meme en favoritos y eliminamos de favourites
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

//
router.get('/community/:id', isLoggedIn, async (req, res) => {
  const favId = req.params.id; // id meme
  console.log(favId);

  const userId = req.session.currentUser._id; // id usuario
  const user = await User.findById(userId);
  //Si el usuario no tiene en favourites el id del meme, lo incluimos
  if (user.favourites.indexOf(favId) === -1) {
    const updateFav = await User.findByIdAndUpdate(userId, {
      $push: { favourites: favId },
    });
    res.redirect('/memes/community');
  } else {
    // si ya lo tenía en favoritos, lo eliminamos con $pullAll
    const deleted = await User.findByIdAndUpdate(
      { _id: userId },
      { $pullAll: { favourites: [favId] } }
    );
    res.redirect('/memes/community');
  }
});

router.get('/community', async (req, res) => {
  const getAll = await Meme.find().populate('owner').lean();

  const userid = req.session.currentUser._id;
  const user = await User.findById(userid);
  // Si el usuario tiene un meme en favoritos. Añadimos a ese meme la propiedad checked.
  // Luego utilizamos ese checked en la pagina community 
  for(let memes of getAll){
      if (user.favourites && user.favourites.includes(memes._id)) {
        memes['checked'] = true;
     }
    }
    req.session.favourites = getAll;

    let userName = req.session.currentUser.username.charAt(0).toUpperCase();
    const isAuthorized = req.session.currentUser ? true : false;
    res.render('meme-finished', { isAuthorized, userid, getAll, userName });
  } else res.render('meme-finished', { getAll });
});


// ruta creada para el addeventlistener que lleva el contador de likes. La acción comienza en el addevenlistener
// Cuando se hace click hay un fetch que tiene esta url. Entramos aquí, cogemos el valor de likes que tiene el meme
// y sumamos o restamos un like dependiendo si el meme tiene la id del usuario dentro de likedbyuser.
// Actualizamos el valor de likes del meme y devolvemos el valor con res.json para acabar la accion en la funcion del addeventlistener
router.put('/liked/:id', async (req, res)=>{
  const user = req.session.currentUser._id
  const memeId = req.params.id
  const meme = await Meme.findById(memeId)
  let valueLikes = meme.likes
  if(!meme.likedByUser.includes(user)){
    const liked = await Meme.findByIdAndUpdate(memeId, {$push: { likedByUser: user }})
    valueLikes += 1
  }else{
    const notLiked = await Meme.findByIdAndUpdate(memeId, {$pull: { likedByUser: user }})
    valueLikes -= 1
  }
  const memeLiked = await Meme.findByIdAndUpdate(memeId, {likes: valueLikes}, {new: true})
  res.json(memeLiked)

})


router.get('/', async (req, res, next) => {
  try {
    const getMemes = await MemeApi.getAll();
    const allMemes = getMemes.data.data.memes;
    const isAuthorized = req.session.currentUser ? true : false;
    res.render('meme-list', { allMemes, isAuthorized });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
