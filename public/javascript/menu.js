$(document).ready(function(){
	var element = $('meta[name="active-menu"]').attr('content');
	//console.log("Element from menu.js", element);
	$('#'+element).addClass('active');
});