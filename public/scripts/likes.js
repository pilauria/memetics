const addLike = (event) =>{
    const id = event.currentTarget.dataset.memeId  
    console.log(id)
    
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
const newFav =  (event) => {
    const id = event.currentTarget.dataset.favId
    console.log(id)

    fetch(`/memes/community/${id}`, {method:"PUT"})
    .then((res)=> res.json())
    .then((meme)=> {
        console.log(meme)
        if(meme==="red"){
            event.target.classList.remove('blank')
            event.target.classList.add('red')
            
        }if(meme==="blank"){
            event.target.classList.remove('red')
            event.target.classList.add('blank')
        }
        
    })
    .catch()
}

const like = document.querySelectorAll(".likesButton");
like.forEach(element => {
    element.addEventListener('click', addLike);
});
const fav = document.querySelectorAll(".fav");
fav.forEach(element => {
    element.addEventListener("click", newFav)
});