function toggleAll(source) {
  checkboxes = document.getElementsByName("transcrypt");
  for(var i=0; i<checkboxes.length; i++) {
    checkboxes[i].checked = source.checked;
  }
}
