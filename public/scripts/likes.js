const addLike = (event) =>{

    const id = event.currentTarget.dataset.memeId  
    fetch(`/memes/liked/${id}`, {method:"PUT"})
    .then((res)=> res.json())
    .then((meme)=> {
        console.log(">>>>>>>>>>event.currentTarget: ",event.target)
        //const likebutton = document.querySelectorAll("#likeButton")
        //if(likebutton.classList.contains("blue")) likebutton.classList.remove("blue")
        //else likebutton.classList.add("blue")
        event.target.innerText = meme.likes
    })
  }

  const like = document.querySelectorAll(".likesButton");
  like.forEach(element => {
      element.addEventListener('click', addLike);
  });