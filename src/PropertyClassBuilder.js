define( ['Class', 'lib/FancyEffects/src/Signal'], function(Class, Signal){

	var PropertyClassBuilder = new Class({
		initialize: function( className ) {
			this._className = className;
			this._properties = [];
			this._value = [];
			this._defaultValues = [];
		},

		_className: null,
		_properties: null,
		_value: null,
		_defaultValues: null, 
		_cssDefinition: null,

		addProperty: function( name, value, defaultValue ) {
			this._properties.push( name );
			this._value.push( value );
			this._defaultValues.push( defaultValue );
		},

		setCSSDefinition: function( definition ) {
			this._cssDefinition = definition;
		},

		build: function() {
			var src = this._getConstructorStr() +
					  this._getSetterGetterStr() +
					  this._getAddStr() +
					  this._getSubStr() +
					  this._getMulScalarStr() +
					  this._getEqualsStr() +
					  this._getResetStr() +
					  this._getGetZeroStr() +
					  this._getGetChangeStr() + 
					  this._getCloneStr();


			src = src.substring( 0, src.length-2 );

			ob = eval( '({' + src + '})' );

			ob.getCSS = this._cssDefinition;

			return ob;
		},

		_getConstructorStr: function() {
			var rVal = 'initialize: function() {\n'

			rVal += 'this.onPropertyChange = new Signal();\n'

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += 'this._' + curProp + ' = arguments[ ' + i + ' ] === undefined ? ' + this._defaultValues[ i ] + ' : arguments[ ' + i + ' ];\n';
				rVal += 'this.__defineGetter__("' + curProp + '", this.get' + curProp + ');\n';
				rVal += 'this.__defineSetter__("' + curProp + '", this.set' + curProp + ');\n\n';
			}

			rVal += '},\n'

			return rVal;
		},

		_getSetterGetterStr: function() {
			var rVal = '';

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += '\tget' + curProp + ': function() { return this._' + curProp + ' ; },\n';

				rVal += '\tset' + curProp + ': function( value ) { \n'+
					'\t\tthis._' + curProp + ' = value;' +
					'\t\tthis.onPropertyChange.dispatch();' +
				'},\n';
			}

			return rVal;
		},

		_getAddStr: function() {
			var rVal = '\tadd: function(otherItem) {\n';

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += '\t\tthis._' + curProp + ' += otherItem.' + curProp + ';\n';
			}
			
			rVal += '\t\treturn this;\n \t},\n';

			return rVal;
		},

		_getSubStr: function() {
			var rVal = '\tsub: function(otherItem) {\n';

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += '\t\tthis._' + curProp + ' -= otherItem.' + curProp + ';\n';
			}
			
			rVal += '\t\treturn this;\n \t},\n';

			return rVal;
		},

		_getMulScalarStr: function() {
			var rVal = '\tmulScalar: function(scalar) {\n';

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += '\t\tthis._' + curProp + ' *= scalar;\n';
			}
			
			rVal += '\t\treturn this;\n \t},\n';

			return rVal;
		},

		_getEqualsStr: function() {
			var rVal = '\tequals: function(otherItem) {\n';

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += '\t\tthis._' + curProp + ' = otherItem.' + curProp + ';\n';
			}
			
			rVal += '\t\treturn this;\n \t},\n';

			return rVal;
		},

		_getResetStr: function() {
			var rVal = '\treset: function(otherItem) {\n';

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += '\t\tthis._' + curProp + ' = ' + this._defaultValues[ i ] + ';\n';
			}
			
			rVal += '\t\treturn this;\n \t},\n';

			return rVal;
		},

		_getGetZeroStr: function() {
			var rVal = '\getZero: function() {\n';

			//rVal += '\t\treturn new ' + this._className + '('
			rVal += '\t\treturn new this.constructor('

			for(var i = 0, len = this._properties.length - 1; i < len; i++ ) {
				rVal += '0, ';	
			}

			rVal += '0);\n},\n';

			return rVal;
		},

		_getGetChangeStr: function() {
			var rVal = '\tgetChange: function( percentage, curValue, startValue, endValue ) {\n';

			for(var i = 0, len = this._properties.length; i < len; i++ ) {
				var curProp = this._properties[ i ];

				rVal += '\t\tthis._' + curProp + ' = (endValue.' + curProp + ' - startValue.' + curProp + ') * percentage + startValue.' + curProp + ';\n';
				rVal += '\t\tthis._' + curProp + ' -= curValue.' + curProp + ';\n';
			}

			rVal += '\t\treturn this;\n\t},\n';

			return rVal;
		},

		_getCloneStr: function() {
			var rVal = '\tclone: function() {\n';

			//rVal += '\t\treturn new ' + this._className + '('
			rVal += '\t\treturn new this.constructor('

			for(var i = 0, len = this._properties.length - 1; i < len; i++ ) {
				rVal += 'this._' + this._properties[ i ] + ', ';	
			}

			rVal += 'this._' + this._properties[ i ] + ');\n},\n';

			return rVal;
		}
	});

	return PropertyClassBuilder;

});