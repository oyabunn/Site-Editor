
var _fs = require('fs');
var _path = require('path');
var _fm = require('./fileManager.js');
var _users = require('./users.js');

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
		else if(_path.extname(files[i])==='.html')ret.push(files[i]);
	}
	return ret;
}

exports.resCreateNew = function(req, res){
	res.render('new_site.ejs', {});
}

exports.manageSite = function(req, res){
	_fs.exists('./contents', function(isExist){
		if(isExist){
			_fm.getSiteConfig(function(err, configObj){
				if(err){
					// maybe not exist
					exports.resCreateNew(req, res);
					return;
				}
				res.render('manage_site', {siteConfig: configObj});
			})
		}else{
			exports.resCreateNew(req, res);
		}
	});
}

var _template = '{"config":{"view":"article","path":"template.html","publishable":"false","css":["https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"],"js":["http://code.jquery.com/jquery.js","https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"],"title":"Title"},"components":[{"type":"title","value":"Title"},{"type":"content","value":"text"}]}';

var createNewSite = function(req, res){
	_fs.mkdirSync('./contents');
	
	var configObj = {};
	configObj.sitename = req.body.sitename;
	configObj.path_to_static = req.body.path_to_static;
	configObj.template = "template.json";
	overWriteConfig(configObj, function(err){
		if(err){
			res.render('dev_error', {message: 'cant write __site_config.json', description:''+err});	
			return;
		}
		_fs.writeFile('./contents/template.json', _template);
		_users.addNewUser(req.body.email, req.body.password, function(err){
			if(err){
				res.render('dev_error', {message: 'cant add user to __site_config.json', description:''+err});	
				return;
			}
			res.redirect('/manage/');
		})
	});
}

var overWriteConfig = function(configObj, callback){
	_fs.writeFile('./contents/__site_config.json', JSON.stringify(configObj), function(err){
		callback(err);
	})
}

exports.isSiteEmpty = function(callback){
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			callback(true);
			return;
		}
		callback(false);
	})
}

exports.editSite = function(req, res){
	if(req.body.email && req.body.password){
		createNewSite(req, res);
		return;
	}
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			// maybe not exist
			exports.resCreateNew(req, res);
			return;
		}
		configObj.sitename = req.body.sitename;
		configObj.path_to_static = req.body.path_to_static;
		overWriteConfig(configObj, function(err){
			if(err){
				res.render('dev_error', {message: 'cant write __site_config.json', description:''+err});	
				return;
			}
			res.redirect('/manage/');
		})
	})
}

exports.manage = function(req, res){
	var dirPath = ''+req.params;
	var relativePath = _path.join('./contents', dirPath);
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			console.log('opendir error: '+err);
			res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
			return;
		}
		_fs.readdir(relativePath, function(err, files){
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

exports.create = function(req, res)
{
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			console.log('opendir error: '+err);
			res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
			return;
		}
		var requestedPath = ''+req.params;
		var relativePath = _path.join('./contents', requestedPath);
		if(req.body.categoryname){
			relativePath = _path.join(relativePath, req.body.categoryname);
			_fs.mkdir(relativePath, function(err){
				if(err){
					res.render('dev_error', {message: 'category creation error', description:''+err});
					return;
				}
				res.redirect(_path.join('/manage', requestedPath, req.body.categoryname));
			})
		}else if(req.body.articlefilename){
			var filebasename = req.body.articlefilename;
			req.body.articlefilename = req.body.articlefilename + '.json';
			relativePath = _path.join(relativePath, req.body.articlefilename);
			_fs.readFile(_path.join('./contents', configObj.template) , function (err, txtObj){
				var txt = ''+txtObj;
				if (err){
					res.render('dev_error', {message: 'read template error', description:''+err});
					return;
				}
				
				var templateObject = null;
				try{
					templateObject = JSON.parse(txt);
				}catch (e){
					templateObject = null;
				}
				if(!templateObject){
					res.render('dev_error', {message: 'cant parse template file', description:''});
					return;
				}
				if(!templateObject.config){
					res.render('dev_error', {message: 'no config in template', description:''});
					return;
				}
				templateObject.config.title = req.body.articletitle;
				templateObject.config.publishable = true;
				_fs.exists(relativePath, function(isExist){
					if(isExist){
						res.render('dev_error', {message: 'requested article is already exist', description:''});
					}else{
						_fs.writeFile(relativePath, JSON.stringify(templateObject), function(err){
							if(err){
								res.render('dev_error', {message: 'article save error', description:''+err});
								return;
							}
							console.log('created new article['+relativePath+']');
							requestedPath = requestedPath.replace('.json', '');
							res.redirect(_path.join('/edit', requestedPath, req.body.articlefilename));
						})
					}
				})
			});
		}else {
			res.render('dev_error', {message: 'Path['+requestedPath+'] is not category or article', description:''});
		}
	});
}

exports.deleteContent = function(req, res){
	var requestedPath = ''+req.params;
	var relativePath = _path.join('./contents', requestedPath);
	var isDirectory = (_path.extname(relativePath).length==0)
	if(isDirectory){
		console.log('try delete directory :'+relativePath);
		// TODO
		_fs.rmdir(relativePath, function(err){
			if(err){
				res.render('dev_error', {message: 'Path['+requestedPath+'] cant delete', description:''+err});
				return;
			}
			var parentPath = _path.dirname(requestedPath);
			if(!parentPath || parentPath.length==0 || parentPath ==='.')res.redirect('/manage/');
			else res.redirect(_path.join('/manage', parentPath));
		})
	}else{
		console.log('try delete file :'+relativePath);
		_fm.getSiteConfig(function(err, configObj){
			if(err){
				console.log('opendir error: '+err);
				res.render('dev_error', {message: 'cant find __site_config.json', description:''+err});	
				return;
			}
			
			var staticHtmlPath = _path.join(configObj.path_to_static, requestedPath);
			_fs.unlink(staticHtmlPath, function(err){
				// ignore error. it is possible just .json file(not published)
					_fm.deleteContentFile(requestedPath, function(err){
					if(err){
						res.render('dev_error', {message: 'Path['+requestedPath+'] cant delete', description:''+err});
						return;
					}
					var parentPath = _path.dirname(requestedPath);
					if(!parentPath || parentPath.length==0 || parentPath ==='.')res.redirect('/manage/');
					else res.redirect(_path.join('/manage', parentPath));
				})
			})
		});
	}
}