(function() {
  var form = document.getElementById('transcripts'); //Get Form
  var elements = form.elements; //All elemens in Form
  var options = elements.transcrypt; //Array: transcrypt check boxes
  var all = document.getElementById('all'); //The 'all' checkbox

  function updateAll() {
    for (var i = 0; i < options.length; i++) { //Loop through checkboxes
    options[i].cheked = all.checked;
  }
  }

  addEvent(all, 'change', updateAll); // Add event listener

  function clearAllOption(e) {
    var target = e.target || e.srcElement;
    if (!target.checked) {
      all.checked = false;
    }
  }

  for (var i = 0; i < options.length; i++) {
    addEvent (options [i], 'change', clearAllOption);
  }
} ());
