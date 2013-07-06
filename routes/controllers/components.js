
exports.build = function(string){
	var builder = new componentsBuilder(string);
	return builder;
};

var componentsBuilder = function(string){
	this.components = [];
	this.css = [];
	this.js = [];
	this.build(string);
};

componentsBuilder.prototype = {
	
	build: function(string){
		this.buildComponents(string);
		this.getDefinitions();
		this.applyAttributions();
	},
			
	buildComponents: function(string){
		if(typeof(string)!='string'){
			console.log('error: type:'+typeof(string)+' is not equal to string');
			return;
		}
		// type separation
		var preConstructor = new typeConstructor();
		for(var index=0; index<string.length+1; index++){
			// obj may object:newType string:passing null:reading
			var obj;
			if(index!=string.length)obj = preConstructor.construct(string.charAt(index));
			else obj = preConstructor.finallyze();
			
			if(!obj){} // do nothing
			else if(typeof(obj)==='string')this.appendStringToLastComponent(obj);
			else if(typeof(obj)==='object')this.appendComponentObject(obj);
		}
	},
			
	getDefinitions: function(){
		// js css importion
		for(var index=0; index<this.components.length; index++){
			var component = this.components[index];
			if(component.type==='css' || component.type==='js'){
				if(component.type==='css'){
					this.css.push(component.value);
				}else if(component.type==='js'){
					this.js.push(component.value);
				}
				
				this.components.splice(index, 1);
			}
		}
	},
	
	applyAttributions: function(){
		// text attributions
		for(var index=0; index<this.components.length; index++){
			var component = this.components[index];
			var buffer = '';
			if(component.type==='content'){
				for(var i=0; i<component.value.length; i++){
					var charactor = component.value.charAt(i);
					if(charactor==='\n'){
						buffer += '</br>';
					}else{
						buffer += charactor;
					}
				}
				this.components[index].value = buffer;
			}
		}
	},
			
	getDefaultComponent: function(){
		return {
			type:'content',
			value:''
		};
	},
	
	appendStringToLastComponent: function(str){
		if(this.components.length==0){
			this.components.push(this.getDefaultComponent());
		}
		
		var lastComponent = this.components[this.components.length-1];
		lastComponent.value += str;
	},
	
	appendComponentObject: function(newComponent){
		this.components.push(newComponent);
		this.components.push(this.getDefaultComponent());
	}
	
};

//=============================================//
// filling values and filling components
//=============================================//

// types categorized by length

var concatAll = function(array){
	var ret = '';
	for(var i=0; i<array.length; i++){
		if(i!=0)ret+=',';
		ret += array[i];
	}
	return ret;
};

var _recognizableTypes = {
	0:{},
	1:{},
	2:{},
	3:{},
	4:{
		'::js': function(values){
			return {
				type: 'js',
				value: concatAll(values)
			};
		}
	},
	5:{
		'::css': function(values){
			return {
				type: 'css',
				value: concatAll(values)
			};
		}
	},
	6:{
		'::bold': function(values){
			return '<b>'+values[0]+'</b>';
		},
		'::link': function(values){
			if(values.length<2)return values[0];
			return '<a href='+values[1]+'>'+values[0]+'</a>';
		}
	},
	7:{
		'::title': function(values){
			return {
				type: 'title',
				value: concatAll(values)
			};
		},
		'::image': function(values){
			return {
				type: 'image',
				value: concatAll(values)
			};
		}
	}
};

var typeConstructor = function(){
	this.state = null;
	this.buffer = '';
	this.values = [];
	this.f = null;
};

typeConstructor.prototype = {
	
	reset: function(){
		this.state = null;
		this.buffer = '';
		this.values = [''];
		this.f = function(){return '';};
		
		this.prepareBracket = false;
		this.bracket = false;
		this.bracketCount = 0;
	},
	
	construct: function(charactor){
		if(!this.state){
			if(charactor===':'){
				this.state = 'readtype';
				this.values = [''];
				this.buffer = charactor;
				return null;
			}
			return charactor;
			
		}else if(this.state==='readtype'){
			this.buffer += charactor;
			if(this.buffer.length==2 && this.buffer!=='::'){		// for speed. this is not important
				var ret = this.buffer;
				this.reset();
				return ret;
			}else if(charactor==='\n'){
				var ret = this.buffer;
				this.reset();
				return ret;
			}
			var types = _recognizableTypes[this.buffer.length];
			if(!types){
				// this type is too long. this is not type i know.
				var ret = this.buffer;
				this.reset();
				return ret;
			}else{
				for(var targetType in types){ //search all of types that length match to buffer
					if(targetType===this.buffer){
						// recognized
						this.state = 'readvalue';
						this.values = [''];
						this.f = types[targetType];
						this.prepareBracket = true;
						this.bracket = false;
						this.bracketCount = 0;
					}
				}
			}
			return null;
			
		}else if(this.state==='readvalue'){
			// found ::bold( <= this
			// so we need detect ) and recognize , 
			if(this.prepareBracket==true && charactor==='('){
				this.buffer += charactor;
				this.bracket = true;
				this.prepareBracket = false;
				this.bracketCount = 1;
				return;
			}
			this.prepareBracket = false;
			var oldValue = this.values[this.values.length-1];
			if((charactor===' ' || charactor==='　' || charactor==='\t') && oldValue.length===0){
				// skipping space
				this.buffer += charactor;
			}else if(charactor==='\n' && !this.bracket){
				this.state = null;
				this.buffer = '';
				var ret = this.f(this.values);
				return ret;
			}else if(charactor===',' && this.bracket){
				this.values.push('');
			}else if(charactor===')' && this.bracket && this.bracketCount===1){
				this.state = null;
				this.buffer = '';
				var ret = this.f(this.values);
				return ret;
			}else{
				if(this.bracket && charactor==='(')this.bracketCount = this.bracketCount +1;
				else if(this.bracket && charactor===')')this.bracketCount = this.bracketCount - 1;
				this.buffer += charactor;
			    this.values[this.values.length-1] += charactor;
			}
			
		}else{
			// error
		}
	},
	
	finallyze: function(){
		if(!this.state){
			return null;
		}else if(this.state==='readtype'){
			this.state = null;
			return this.buffer;
		}else if(this.state==='readvalue'){
			this.state = null;
			return this.f(this.values);
		}
	}
 };