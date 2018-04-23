///// ORIGINAL jQUERY CODE /////
//
// $(document).foundation()
// $('[data-addCart]').click(function() {
//   $(this).addClass('is-adding')
//   console.log(this);
//   setTimeout(function() {
//   $('[data-addCart]').removeClass('is-adding')
//   $('[data-successMessage]').removeClass('hide')
//   }, 2500);
// });


///// LAUREN'S CODE /////
function requestSubmitted(e) {
    let button = e.target;
    let containerDiv = button.parentElement;
    let message = containerDiv.children[1];
    // button.classList.add('is-adding');
    setTimeout(function() {
        // button.classList.remove('is-adding');
        message.classList.remove('hide');
    }, 2500);
}

function setEventListeners() {
    buttons = document.getElementsByClassName('button-add-cart');
    for (i=0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            requestSubmitted(e)}
        );
    }
}

setEventListeners();
