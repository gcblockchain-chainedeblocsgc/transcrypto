let transcript = new Vue({
    el: '#transcript',
    data: {
        "institution": {
            "type": "University",
            "name": "University of Toronto",
            "abbreviation": "UofT",
            "address": "27 King's College Cir, Toronto, ON M5S 3H7",
            "website": "https://www.utoronto.ca/",
            "logo_url": "https://vignette.wikia.nocookie.net/logopedia/images/a/aa/University_of_Toronto.png/revision/latest?cb=20100916042554"
        },
        "student": {
            "name": "Jhon Doe",
            "birthday": "1994-05-05",
            "id": {
                "type": "passport",
                "number": "RT1231SD341"
            },
            "institution_id": "DA1231GJ234"
        },
        "course": {
            "name": "Computer Science",
            "major": "Bachelor",
            "disciplines": [{
                    "code": "2023",
                    "year": "2009",
                    "name": "Basic Computing",
                    "grade": "100",
                    "hours": "60"
                },
                {
                    "code": "2024",
                    "year": "2009",
                    "name": "Computational Mathematics",
                    "grade": "95",
                    "hours": "60"
                },
                {
                    "code": "2025",
                    "year": "2009",
                    "name": "Linear Algebra",
                    "grade": "95",
                    "hours": "60"
                },
                {
                    "code": "4186",
                    "year": "2009",
                    "name": "Algorithms and Programming",
                    "grade": "100",
                    "hours": "120"
                },
                {
                    "code": "1760",
                    "year": "2009",
                    "name": "Calculus",
                    "grade": "80",
                    "hours": "60"
                },
                {
                    "code": "2160",
                    "year": "2009",
                    "name": "Technical English",
                    "grade": "85",
                    "hours": "60"
                },
                {
                    "code": "2161",
                    "year": "2009",
                    "name": "Research Methodology",
                    "grade": "85",
                    "hours": "30"
                },
                {
                    "code": "4187",
                    "year": "2009",
                    "name": "Digital Circuits",
                    "grade": "80",
                    "hours": "60"
                },
                {
                    "code": "4188",
                    "year": "2009",
                    "name": "Algorithms and Programming",
                    "grade": "90",
                    "hours": "90"
                },
                {
                    "code": "1767",
                    "year": "2010",
                    "name": "Calculus",
                    "grade": "80",
                    "hours": "60"
                },
                {
                    "code": "1799",
                    "year": "2010",
                    "name": "Ethics in IT",
                    "grade": "100",
                    "hours": "30"
                },
                {
                    "code": "4189",
                    "year": "2010",
                    "name": "Computers Architecture and Organization",
                    "grade": "85",
                    "hours": "60"
                },
                {
                    "code": "4190",
                    "year": "2010",
                    "name": "Data Structure",
                    "grade": "95",
                    "hours": "90"
                },
                {
                    "code": "4191",
                    "year": "2010",
                    "name": "Programming",
                    "grade": "85",
                    "hours": "60"
                },
                {
                    "code": "2165",
                    "year": "2010",
                    "name": "Numeric Calculus",
                    "grade": "80",
                    "hours": "60"
                },
                {
                    "code": "2166",
                    "year": "2010",
                    "name": "Uncertainty Modality",
                    "grade": "85",
                    "hours": "60"
                },
                {
                    "code": "3641",
                    "year": "2010",
                    "name": "Programming",
                    "grade": "85",
                    "hours": "90"
                },
                {
                    "code": "3642",
                    "year": "2010",
                    "name": "Computing and Society",
                    "grade": "100",
                    "hours": "30"
                },
                {
                    "code": "4192",
                    "year": "2010",
                    "name": "Computers Architecture and Organization",
                    "grade": "100",
                    "hours": "60"
                }
            ]
        }
    }
})
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
