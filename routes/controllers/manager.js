
var _fs = require('fs');
var _path = require('path');

var getSiteConfig = function(callback){
	_fs.readFile('./contents/__site_config.json', function(err, data){
		if(err){
			callback(err);
			return;
		}
		
		var configObj = null;
		try{
			configObj = JSON.parse(''+data);
		}catch(e){
			configObj = null;
		}
		if(!configObj){
			callback('parseError');
			return;
		}
		callback(null, configObj);
	});
}

var removeSystemFileInFileNames = function(files){
	if(files.length==0)return;
	for(var i=files.length-1; i>=0; i--){
		if(files[i]==='__site_config.json')files.splice(i,1);
	}
}

var categoriesInFileNames = function(files){
	var ret = [];
	for(var i=0; i<files.length; i++){
		if(_path.extname(files[i]).length==0)ret.push(files[i]);
	}
	return ret;
}

var articlesInFileNames = function(files){
	var ret = [];
	for(var i=0; i<files.length; i++){
		if(_path.extname(files[i])==='.json')ret.push(_path.basename(files[i], '.json'));
	}
	return ret;
}

exports.manage = function(req, res){
	var dirPath = ''+req.params;
	var relativePath = _path.join('./contents', dirPath);
	getSiteConfig(function(err, configObj){
		if(err){
			console.log('opendir error: '+err);
			res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
			return;
		}
		_fs.readdir(relativePath, function(err, files){
			for(var key in files)console.log('file: '+files[key]);
			if(err){
				console.log('opendir error: '+err);
				res.render('dev_error', {message: 'Path['+dirPath+'] cant open this。 no directory or invalid permission', description:''+err});
				return;
			}
			
			removeSystemFileInFileNames(files);
			var categories = categoriesInFileNames(files);
			var articles = articlesInFileNames(files)
			
			res.render('pages_list', {title:''+configObj.sitename+' /'+dirPath ,categories:categories, articles:articles, dir:dirPath, _path:_path});
		});
	});
}