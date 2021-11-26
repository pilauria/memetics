const addLike = event => {
  const id = event.currentTarget.dataset.memeId;

  fetch(`/memes/liked/${id}`, { method: 'PUT' })
    .then(res => res.json())
    .then(meme => {
      event.target.innerText = meme.likes;
    });
};

const like = document.querySelectorAll('.likesButton');
like.forEach(element => {
  element.addEventListener('click', addLike);
});
