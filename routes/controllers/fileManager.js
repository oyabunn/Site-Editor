
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

exports.overWriteContentFile = function(path, pageObject, callback){
	path = path.replace('.html', '.json');
	var relativePath = _path.join('./contents', path);
	_fs.exists(relativePath, function(isExist){
		if(isExist){
			_fs.writeFile(relativePath, JSON.stringify(pageObject), function(err){
				callback(err);
			});
		}else{
			
		}
	})
}