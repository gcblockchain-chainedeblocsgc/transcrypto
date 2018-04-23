// $(document).foundation()
// $('[data-addCart]').click(function() {
//   $(this).addClass('is-adding')
//   setTimeout(function() {
//   $('[data-addCart]').removeClass('is-adding')
//   $('[data-successMessage]').removeClass('hide')
//   }, 2500);
// });

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

buttons = document.getElementsByClassName('button-add-cart');
console.log(buttons[0].className + buttons [1] + buttons[2]);

for (i=0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function(e) {
        requestSubmitted(e)}
    );
}
