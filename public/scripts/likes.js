

const addLike = (event) =>{
    console.log(event.currentTarget)

    const id = event.currentTarget.dataset.memeId  
    console.log(id)
    fetch(`/memes/liked/${id}`, {method:"PUT"})
    .then((res)=> res.json())
    .then((meme)=> {
        console.log(">>>>>>>>>>event.currentTarget: ",event)
    
        event.target.innerText = meme.likes
    })
    //const likedMeme = await Meme.findByIdAndUpdate()
  }

  const like = document.querySelectorAll(".likesButton");
  like.forEach(element => {
      element.addEventListener('click', addLike);
  });
