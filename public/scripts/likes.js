

const addLike = (event) =>{

    const id = event.currentTarget.dataset.memeId  
    console.log(id)
    fetch(`/memes/liked/${id}`, {method:"PUT"})
    .then((res)=> res.json())
    .then((meme)=> {
        console.log(">>>>>>>>>>event.currentTarget: ",event.target)
    
        event.target.innerText = meme.likes
    })
  }

  const like = document.querySelectorAll(".likesButton");
  like.forEach(element => {
      element.addEventListener('click', addLike);
  });
