$(document).ready(function () {
$('#file').bind('change', function() { var fileName = 'dfv'; fileName = $(this).val().replace(/C:\\fakepath\\/i, ''); $('#file-selected').html(fileName); }) 

});

const btn = document.getElementById("submit")
const form = document.getElementById("mainform")
btn.addEventListener('click', ()=>{
  mainform.submit()
})
