/////////////////////////////////////////////////////////////////

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

/*
<button id='submitButton'> Button </button>


<form>
  <input id='inputSubmit' type="submit" value="Submit button" />
</form>
*/
