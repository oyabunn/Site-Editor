var _crypto = require('crypto');
var _moment = require('moment');
var _fm = require('./fileManager.js');
var _manager = require('./manager.js');

var _secretWord = null;

exports.isAcceptedRequestAsAdmin = function(req){
	if(req.session.key===_secretWord)return true;
	return false;
}

exports.showLoginForm = function(req, res){
	res.render('login_form', {});
}

var generateSessionKey = function(email)
{
	return _crypto.createHash('sha256').update(_moment().format('MM/DDyukiHHmmss'+email)).digest("hex");
};

var encryptedPassword = function(password)
{
	var val = password;
	for(var i=0; i<2; i++){
		val = _crypto.createHash('sha256').update(val).digest("hex");
	}
	return val;
};

exports.login = function(req, res){
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			_manager.resCreateNew(req, res);
			return;
		}
		
		console.log(''+encryptedPassword(req.body.password)+':'+configObj.admin_password);
		if(req.body.email===configObj.admin_email && encryptedPassword(req.body.password)===configObj.admin_password){
			_secretWord = generateSessionKey(req.body.email);
			req.session.key = _secretWord;
			res.redirect('/manage/');
		}else{
			res.render('dev_error', {message: 'does not math', description:''});
		}
	});
}

var overWriteConfig = function(configObj, callback){
	_fs.writeFile('./contents/__site_config.json', JSON.stringify(configObj), function(err){
		callback(err);
	})
}

exports.addNewUser = function(email, password, callback){
	_fm.getSiteConfig(function(err, configObj){
		if(err){
			callback(err)
			return;
		}
		configObj.admin_email = email;
		configObj.admin_password = encryptedPassword(password);
		overWriteConfig(configObj, callback);
	})
}