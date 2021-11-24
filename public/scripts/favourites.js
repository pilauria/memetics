const Meme = require('../../models/Meme.model')
const isFavourite = () =>{
    console.log("hello")
    const target = event.currentTarget;
    console.log(target)
  }
  
  const favourites = Meme.find

  const favourite = document.querySelector(`${favourites}`);
  favourite.addEventListener('click', isFavourite);