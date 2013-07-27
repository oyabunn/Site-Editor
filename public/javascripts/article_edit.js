
// menu functions

window.onkeydown = function(e){
  if((e.metaKey || e.ctrlKey) && e.keyCode == 66){ //'Command + B'
    applyBold();
  }else if((e.metaKey || e.ctrlKey) && e.keyCode == 76){ //'Command + L'
    applyLink();
  }
}

var appendComponent = function(type){
	
	var lastComponent = $("#editspace .component:last");
	if(lastComponent && (type==="title" || type==="content") && lastComponent.hasClass("component-"+type)){
		alert('you already have '+type+' bottom of page.');
		return
	}
	
	var innerHTML = $("#editspace").html();
	innerHTML = innerHTML + componentHTMLs[type];
	$("#editspace").html(innerHTML);
	// scroll to bottom
	setTimeout('scrollToBottom()',100);
}

var scrollToBottom = function(){
	window.scrollTo(0, document.body.scrollHeight);
}

var uploadImage = function(){
	var $form, fd;
    $form = $("#image-upload-form");
    fd = new FormData($form[0]);
    $.ajax($form.attr("action"), {
		type: 'post',
		processData: false,
		contentType: false,
		data: fd,
		success: function(jsonObj){
			console.log("here: "+jsonObj);
			if(!jsonObj || typeof(jsonObj)!=='object'){
				alert('upload fail');
				return;
			}
			var imageUrl = jsonObj.image_url;
			if(!imageUrl || imageUrl.length==0){
				alert('upload fail.');
				return;
			}
			$('#choosed-image').attr('src', imageUrl);
		},
		error: function(request, status, error){
			alert('upload fail:' +error);
		}
    });
}

var applyNewImageUrl = function(){
	var url = $('#image-url-field').val();
	$('#choosed-image').attr('src', url);
}

var addNewImageComponent = function(){
	var url = $('#choosed-image').attr('src');
	if(!url || url.length==0){
		alert('??? no image url');
		return;
	}
	
	var innerHTML = $("#editspace").html();
	innerHTML = innerHTML + '<center><img class="component component-image" src="'+url+'" href="<%-component.value%>"/></center>';
	$("#editspace").html(innerHTML);
	
	$("#upload-modal").modal("hide");
	setTimeout('scrollToBottom()',100);
}

var applyBold = function(){
	var selection = window.getSelection();
	var range  = selection.getRangeAt(0);
	
	var newNode = document.createElement("b");
	range.surroundContents(newNode);
}

var _lastSelectedRange

var applyLink = function(){
	var selection = window.getSelection();
	_lastSelectedRange = selection.getRangeAt(0);
	$("#link-modal").modal("show");
}

var setLinkToSelection = function(){
	var url = $("#link-setting-field").val();
	var range = _lastSelectedRange
	
	var newNode = document.createElement("a");
	newNode.setAttribute("href", ""+url);
	range.surroundContents(newNode);
	
	$("#link-modal").modal("hide");
}

var saveComponents = function(){
	var components = getComponents();
	
	var data = {
		page_object:{
			config: SCPageConfig,
			components: components
		}
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

var publishComponents = function(){
var components = getComponents();
	
	var data = {
		page_object:{
			config: SCPageConfig,
			components: components
		}
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

// internals

var componentHTMLs = {
	title: '<h3><div class="page-header component component-title" contenteditable=true>Title</div></h3>',
	content: '<div class="component component-content" contenteditable=true>as you like</div>'
}

var getComponents = function(){
	var components = [];
	
	$("#editspace .component").each(function(){
		var newComponent = null;
		if($(this).hasClass("component-title")){
			newComponent = {
				type: 'title',
				value: $(this).html()
			};
		}else if($(this).hasClass("component-image")){
			newComponent = {
				type: 'image',
				value: $(this).attr('src')
			};
		}else if($(this).hasClass("component-content")){
			newComponent = {
				type: 'content',
				value: $(this).html()
			};
		}else{
			// unknown
		}
		if(newComponent)components.push(newComponent);
	});
	return components;
}