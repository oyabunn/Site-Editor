
var _contentUtil = require('./content-utils.js');
var _fm = require('./fileManager.js');
var _path = require('path');
var _fs = require('fs');
var _ejs = require('ejs');

var isArticlePath = function(path){
	return (_path.extname(path)==='');
}

var isHtmlPath = function(path){
	return (_path.extname(path)==='.html');
}

// image receiver
exports.fileReceiver = function(req, res){
    var tmp_path = req.files.uploadimage.path;
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			console.log('opendir error: '+err);
			res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
			return;
		}
		
		var imageDirPath = _path.join(configObj.path_to_static, 'images');
		if(!_fs.existsSync(imageDirPath)){
			_fs.mkdirSync(imageDirPath);
		}
		
		var pubImageDirPath = _path.join('public', 'images');
		if(!_fs.existsSync(pubImageDirPath)){
			_fs.mkdirSync(pubImageDirPath);
		}
		
		var targetPath = _path.join(imageDirPath, req.files.uploadimage.name);
		_fs.link(tmp_path, _path.join(pubImageDirPath, req.files.uploadimage.name), function(err){
			if (err){
				console.log('File uploaded link1 failed: '+ err);
				sendSimpleResponse(res, 403, 'File upload fail: '+err);
				return;
			}
			_fs.link(tmp_path, targetPath, function(err) {
				if (err){
					console.log('File uploaded link2 failed: '+ err);
					sendSimpleResponse(res, 403, 'File upload fail: '+err);
					return;
				}
				_fs.unlink(tmp_path, function() {
					if (err){
						console.log('File uploaded unlink failed: '+ err);
						sendSimpleResponse(res, 403, 'File upload fail: '+err);
						return;
					}
					console.log('File uploaded to: ' + targetPath + ' - ' + req.files.uploadimage.size + ' bytes');
					sendJsonResponse(res, 200, {image_url: _path.join('/images/', req.files.uploadimage.name)});
				});
			});
		})
	});
}

exports.view = function(req, res){
	var path = ''+req.params;
	console.log('here:path:'+path+':'+_path.extname(path));
	
	if(isArticlePath(path)){
		// read json
		_fm.getArticleContentsFile(path, function(err, txt){
			if(err){
				res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
				return;
			}

			var pageObject = _contentUtil.getPageObject(txt);
			if(pageObject)res.render('scaffolds/'+pageObject.config.view , {pageObject: pageObject, pagePath:path});
			else res.render('dev_error', {message: 'cant parse ['+path+'] file', description:''+err});
		});
	}else if(isHtmlPath(path)){
		_fm.getHtmlContentsFile(path, function(err, txt){
			if(err){
				res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
				return;
			}
			res.render('scaffolds/html' , {code: txt, pagePath:path});
		});
	}else{
		// unknown
		res.render('dev_error', {message: 'Path['+path+']is not either html and articlefile', description:''});
	}
};

exports.showEditView = function(req, res){
	var path = ''+req.params;
	console.log('here:path:'+path+':'+_path.extname(path));
	
	if(isArticlePath(path)){
		// read json
		_fm.getArticleContentsFile(path, function(err, txt){
			if(err){
				res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
				return;
			}

			var pageObject = _contentUtil.getPageObject(txt);
			if(pageObject)res.render('editor/'+pageObject.config.view , {pageObject: pageObject, pagePath:path});
			else res.render('dev_error', {message: 'cant parse ['+path+'] file', description:''+err});
		});
	}else if(isHtmlPath(path)){
		_fm.getHtmlContentsFile(path, function(err, txt){
			if(err){
				res.render('dev_error', {message: 'Path['+path+']のファイルが開けませんでした。ファイルがないかpermissionがおかしいです', description:''+err});
				return;
			}
			res.render('editor/html' , {code: txt, pagePath:path});
		});
	}else{
		// unknown
		res.render('dev_error', {message: 'Path['+path+']is not either html and articlefile', description:''});
	}
};

exports.publish = function(req, res){
	var path = ''+req.params;
	
	if(isArticlePath(path)){
		var pageObject = req.body.page_object;
		if(pageObject.config.publishable === false || pageObject.config.publishable === 'false'){
			sendSimpleResponse(res, 403, 'this page publishable = false');
			return;
		}
		publishArticle(res, path, pageObject);
	}else if(isHtmlPath(path)){
		publishHtml(res, path, req.body.code);
	}else{
		res.render('dev_error', {message: 'Path['+path+']is not either html and articlefile', description:''});
	}
};

var publishArticle = function(res, path, pageObject){
	saveArticleContent(path, pageObject, function(err){
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
}

var publishHtml = function(res, path, code){
	_fm.overWriteHtmlContentFile(path, code, function(err){
		if(err){
			sendSimpleResponse(res, 403, 'file write error: '+err);
			return;
		}
		console.log('before output static');
		_fm.getSiteConfig(function(err, configObj){
			if(err){
				console.log('opendir error: '+err);
				res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
				return;
			}
			outputStatic(configObj.path_to_static, path, code, function(err){
				if(err){
					console.log('publisherror:'+err);
					sendSimpleResponse(res, 403, 'publish error: '+err);
					return;
				}
				sendSimpleResponse(res, 200, 'published');
			});
		});
	})
}

var outputStatic = function(staticPath, filePath, content, callback){
	if(isHtmlPath(filePath)){
		var targetPath = _path.join(staticPath, filePath);
		_fm.prepareDirecotoryWithCreate(targetPath, function(err){
			if(err){
				callback(err);
				return;
			}
			_fs.writeFile(targetPath, content, function(err){
				callback(err);
			});
		})
		return;
	}
	_fs.readFile('./views/scaffolds/'+content.config.view+'.ejs' , function (err, data){
		if (err){
			callback(err);
			return;
		}
		var html = '';
		try{
			html = _ejs.render(''+data, {pageObject: content});
		}catch(e){
			console.log('generate html error: '+e);
			html = '';
			callback(e);
			return;
		}
		var targetPath = _path.join(staticPath, filePath+'.html');
		
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

var saveArticleContent = function(path, pageObject, callback){
	if(!path || path.length===0){
		callback('path error :'+path);
		return;
	}
	if(!pageObject || !pageObject.config || !pageObject.components){
		callback('error: you sent incorrect object');
		return;
	}
	_fm.overWriteArticleContentFile(path, pageObject, callback);
}

exports.save = function(req, res){
	var path = ""+req.params;
	if(isArticlePath(path)){
		saveArticleContent(path, req.body.page_object, function(err){
			if(err){
				sendSimpleResponse(res, 403, 'file write error: '+err);
				return;
			}
			sendSimpleResponse(res, 200, 'Saved!');
		});
	}else if(isHtmlPath(path)){
		_fm.overWriteHtmlContentFile(path, req.body.code, function(err){
			if(err){
				sendSimpleResponse(res, 403, 'file write error: '+err);
				return;
			}
			sendSimpleResponse(res, 200, 'Saved!');
		})
	}else{
		sendSimpleResponse(res, 403, 'not either html and json');
	}
};



