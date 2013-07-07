
var _contentUtil = require('./content-utils.js');
var _fm = require('./fileManager.js');
var _path = require('path');
var _fs = require('fs');

exports.showEditView = function(req, res){
	var path = ''+req.params;
	_fm.getContentsFile(path, function(err, filename, txt){
		if(err){
			res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
			return;
		}
		
		var pageObject = _contentUtil.getPageObject(txt);
		if(pageObject)res.render('editor/'+pageObject.config.view , {pageObject: pageObject});
		else res.render('dev_error', {message: 'cant parse ['+path+'] file', description:''+err});
	});
};

var sendSimpleResponse = function(res, status, text){
	res.statusCode = status;
	res.setHeader('Content-Type', 'text/plain');
	res.write(''+text);
	res.end();
}

var sendJsonResponse = function(res, status, obj){
	res.statusCode = status;
	res.setHeader('Content-Type', 'application/json');
	res.write(JSON.stringify(obj));
	res.end();
}

var saveContent = function(path, pageObject, callback){
	if(!path || path.length===0){
		callback('path error :'+path);
		return;
	}
	if(!pageObject || !pageObject.config || !pageObject.components){
		callback('error: you sent incorrect object');
		return;
	}
	_fm.overWriteContentFile(path, pageObject, callback);
}



exports.save = function(req, res){
	saveContent(''+req.params, req.body.page_object, function(err){
		if(err){
			sendSimpleResponse(res, 403, 'file write error: '+err);
			return;
		}
		sendSimpleResponse(res, 200, 'Saved!');
	});
};

exports.outputStatic = function(req, res){
	var staticPath = req.config.path_to_static; // lie a "./public/html" or "/var/www/html"
	
};

exports.publish = function(req, res){
	saveContent(''+req.params, req.body.page_object, function(err){
		if(err){
			sendSimpleResponse(res, 403, 'file write error: '+err);
			return;
		}
		outputStatic(req, res);
	});
};

exports.fileReceiver = function(req, res){
	console.log(''+req.config);
    var tmp_path = req.files.uploadimage.path;
	var staticPath = req.config.path_to_static;
    var target_path = _path.join(staticPath, 'images', req.files.uploadimage.name);
    _fs.rename(tmp_path, target_path, function(err) {
        if (err){
			console.log('File uploaded failed: '+ err);
			sendSimpleResponse(res, 403, 'File upload fail: '+err);
			return;
		}
        _fs.unlink(tmp_path, function() {
            if (err){
				console.log('File uploaded failed: '+ err);
				sendSimpleResponse(res, 403, 'File upload fail: '+err);
				return;
			}
			_fs.link(target_path, _path.join('./public/images', req.files.uploadimage.name), function(err){
				if (err){
					console.log('File uploaded failed: '+ err);
					sendSimpleResponse(res, 403, 'File upload fail: '+err);
					return;
				}
				console.log('File uploaded to: ' + target_path + ' - ' + req.files.uploadimage.size + ' bytes');
				sendJsonResponse(res, 200, {image_url: _path.join('/images/', req.files.uploadimage.name)});
			})
        });
    });
}