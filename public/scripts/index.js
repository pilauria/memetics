('test');
const slider = new Glide('.glide', {
  type: 'carousel',
  startAt: 0,
  perView: 3,
});
slider.mount();

let counter = 0;
let submitButton = document.getElementById('submitButton');
