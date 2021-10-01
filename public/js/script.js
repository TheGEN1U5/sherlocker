$(document).ready(function () {
$('#file').bind('change', function() { var fileName = ''; fileName = $(this).val(); $('#file-selected').html(fileName); }) 

});

const btn = document.getElementById("submit")
const form = document.getElementById("mainform")
btn.addEventListener('click', ()=>{
  mainform.submit()
})
