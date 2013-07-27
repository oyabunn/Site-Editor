
var _contentUtil = require('./content-utils.js');
var _fm = require('./fileManager.js');
var _path = require('path');
var _fs = require('fs');
var _ejs = require('ejs');

exports.showEditView = function(req, res){
	var path = ''+req.params;
	console.log('here:path:'+path);
	_fm.getContentsFile(path, function(err, filename, txt){
		if(err){
			res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
			return;
		}
		
		var pageObject = _contentUtil.getPageObject(txt);
		if(pageObject)res.render('editor/'+pageObject.config.view , {pageObject: pageObject, pagePath:path});
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

var outputStatic = function(staticPath, filePath, pageObject, callback){
	console.log('start publish static['+staticPath+'] view[./views/scaffolds/'+pageObject.config.view+'.ejs]');
	_fs.readFile('./views/scaffolds/'+pageObject.config.view+'.ejs' , function (err, data){
		if (err){
			callback(err);
			return;
		}
		var html = '';
		try{
			html = _ejs.render(''+data, {pageObject: pageObject});
		}catch(e){
			console.log('generate html error: '+e);
			html = '';
			callback(e);
			return;
		}
		
		var targetPath = _path.join(staticPath, filePath);
		
		// shrink html
		_fm.prepareDirecotoryWithCreate(targetPath, function(err){
			if(err){
				callback(err);
				return;
			}
			_fs.writeFile(targetPath, html, function(err){
				callback(err);
			});
		})
	});
};

exports.publish = function(req, res){
	var path = ''+req.params;
	var pageObject = req.body.page_object;
	if(pageObject.config.publishable === false || pageObject.config.publishable === 'false'){
		sendSimpleResponse(res, 403, 'this page publishable = false');
		return;
	}
	
	saveContent(path, pageObject, function(err){
		if(err){
			sendSimpleResponse(res, 403, 'file write error: '+err);
			return;
		}
		_fm.getSiteConfig(function(err, configObj){
			if(err){
				console.log('opendir error: '+err);
				res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
				return;
			}
			outputStatic(configObj.path_to_static, path, pageObject, function(err){
				if(err){
					console.log('publisherror:'+err);
					sendSimpleResponse(res, 403, 'publish error: '+err);
					return;
				}
				sendSimpleResponse(res, 200, 'published');
			});
		});
	});
};

exports.fileReceiver = function(req, res){
    var tmp_path = req.files.uploadimage.path;
    var target_path = _path.join(staticPath, 'images', req.files.uploadimage.name);
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			console.log('opendir error: '+err);
			res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
			return;
		}
		var staticPath = configObj.path_to_static;
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
	});
}