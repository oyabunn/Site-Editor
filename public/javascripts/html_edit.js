
var getEdittedCode = function(){
	return document.getElementById("codespace").innerText;
}

var saveCode = function(){
	var data = {
		code: getEdittedCode()
	};
	
	// checks
	if(!SCPagePath || SCPagePath.length==0){
		alert('[path] is broken');
		return;
	}
	
	$.ajax({
		type:	"POST",
		url:	"/save/"+SCPagePath,
		data:	data,
		success: function(data) {
				alert('Success: '+data);
			},
		error: function(request, status, error){
				alert('Fail: '+error);
			}
		});
}

var publishCode = function(){
	var data = {
		code: getEdittedCode()
	};
	
	// checks
	if(!SCPagePath || SCPagePath.length==0){
		alert('[path] is broken');
		return;
	}
	
	$.ajax({
		type:	"POST",
		url:	"/publish/"+SCPagePath,
		data:	data,
		success: function(data) {
				alert('Success: '+data);
			},
		error: function(request, status, error){
				alert('Fail: '+error);
			}
		});
}