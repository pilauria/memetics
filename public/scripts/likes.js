const addLike = event => {
  document
    .getElementById('username')
    .parentNode.getElementsByTagName('label')[0].innerHTML;

  console.log('aa', event.currentTarget.dataset.memeId);
  fetch(`/memes/liked/${id}`, { method: 'PUT' })
    .then(res => res.json())
    .then(meme => {
      event.target.innerText = meme.likes;
    });
};

const like = document.querySelectorAll('#likeButton');
like.forEach(element => {
  element.addEventListener('click', addLike);
});
