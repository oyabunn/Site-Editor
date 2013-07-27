
var _fs = require('fs');
var _path = require('path');

exports.getContentsFile = function(path, callback){
	path = path.replace('.html', '.json');
	var relativePath = _path.join('./contents', path);
	_fs.readFile(relativePath , function (err, txtObj){
		var txt = ''+txtObj;
		if (err){
			callback(err);
			return;
		}
		callback(null, _path.basename(path), txt);
	});
}

//todo async
exports.prepareDirecotoryWithCreate = function(path, callback){
	var pathes = _path.dirname(path).split(_path.sep);
	var currentPath = '';
	for(var i=0; i<pathes.length; i++){
		currentPath = _path.join(currentPath, pathes[i]);
		if(!_fs.existsSync(currentPath)){
			console.log('create directory' + currentPath);
			_fs.mkdirSync(currentPath);
		}
	}
	callback(null);
}

exports.overWriteContentFile = function(path, pageObject, callback){
	path = path.replace('.html', '.json');
	var relativePath = _path.join('./contents', path);
	_fs.exists(relativePath, function(isExist){
		if(isExist){
			_fs.writeFile(relativePath, JSON.stringify(pageObject), function(err){
				callback(err);
			});
		}else{
			callback('not exist such file:'+path);
		}
	})
}

exports.deleteContentFile = function(path, callback){
	path = path.replace('.html', '.json');
	var relativePath = _path.join('./contents', path);
	_fs.exists(relativePath, function(isExist){
		if(isExist){
			_fs.unlink(relativePath, function(err){
				callback(err);
			});
		}else{
			callback('not exist such file:'+path);
		}
	})
}

exports.getSiteConfig = function(callback){
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