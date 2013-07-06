

var getComponents = function(){
	
	
	
	return ['test',{aa:'bb'}];
};

var componentHTMLs = {
	title: '<div class="page-header component" contenteditable=true><h3>Title</h3></div>',
	content: '<div class="component" contenteditable=true>click me</div>'
};

var appendComponent = function(type){
	var innerHTML = document.getElementById('editspace').innerHTML;
	innerHTML = innerHTML + componentHTMLs[type];
	document.getElementById('editspace').innerHTML = innerHTML;
}