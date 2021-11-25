('test');
const slider = new Glide('.glide', {
  type: 'carousel',
  startAt: 0,
  perView: 3,
});
slider.mount();

let counter = 0;
let submitButton = document.getElementById('submitButton');

submitButton.addEventListener('click', function () {
  counter++;
  console.log(counter);
});

let inputSubmitButton = document.getElementById('inputSubmit');

inputSubmitButton.addEventListener('click', function (e) {
  e.preventDefault();
  counter++;
  console.log(counter);
});
