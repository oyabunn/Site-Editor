

exports.getPageObject = function(txt){
	var pageObject = null;
	try{
		pageObject = JSON.parse(txt);
	}catch(e){
		pageObject = null;
	}
	return pageObject;
}