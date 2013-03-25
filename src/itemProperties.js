var ItemPropertiesBank = {};
ItemPropertiesBank.curKey = 0;
ItemPropertiesBank.items = {};
ItemPropertiesBank.itemCount = {};

ItemPropertiesBank.get = function( jQueryItem ) {
	var rVal = null;

	if( jQueryItem[0].$itemPropertiesIndex === undefined ) {
		jQueryItem[0].$itemPropertiesIndex = ItemPropertiesBank.curKey;
		ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ] = 1;

		rVal = new ItemProperties( jQueryItem );
		ItemPropertiesBank.items[ ItemPropertiesBank.curKey ] = rVal;

		ItemPropertiesBank.curKey++;
	} else {
		rVal = ItemPropertiesBank.items[ jQueryItem[0].$itemPropertiesIndex ];
		ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ]++;
	}

	return rVal;
}

ItemPropertiesBank.destroy = function( jQueryItem ) {
	if( jQueryItem[0].$itemPropertiesIndex !== undefined ) {
		ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ]--;

		if( ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ] == 0) {
			delete ItemPropertiesBank[ jQueryItem[0].$itemPropertiesIndex ];
			delete ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ];
			delete jQueryItem[0].$itemPropertiesIndex;	
		}
	}
}


var ItemProperties = new Class({
	initialize: function(itemToEffect) {
		this._itemToEffect = itemToEffect;
		this._propertiesWatching = {};
		this._propertyValue = {};
		this._propertyStartValue = {};
		this._changeAmountForEffect = {};
		this._enabled = {};
	},

	_itemToEffect: null,
	_propertiesWatching: null,
	_propertyValue: null,
	_changeAmountForEffect: null,
	_enabled: null,

	setupEffect: function( effect ) {
		var effectID = effect.id;

		if (!this._changeAmountForEffect[ effectID ]) {
			this._changeAmountForEffect[ effectID ] = {};
			this._enabled[ effectID ] = {};

			for (var i = 1; i < arguments.length; i++) {
				var property = arguments[i];

				this._setupProperty( effectID, property );
			}
		}
	},
	get: function( property ) {
		return this._propertyValue[property];
	},
	getStart: function( property ) {
		return this._propertyStartValue[property];
	},
	getEffectChange: function( effectID, property ) {
		return this._changeAmountForEffect[ effectID ][ property ];
	},
	change: function( effectID, property, amount ) {
		this._propertyValue[ property ].add( amount );

		this._changeAmountForEffect[ effectID ][ property ].add( amount );

		this._itemToEffect.css( property, this._propertyValue[ property ].getCSS() );
	},
	enable: function( effectID, property ) {
		if( !this._enabled[ effectID ][ property ] ) {
			this._enabled[ effectID ][ property ] = true;
			this._propertyValue[property].add( this._changeAmountForEffect[ effectID ][ property ] );

			this._itemToEffect.css(property, this._propertyValue[property].getCSS());

			if( property == 'opacity' )
				console.log( 'enable', property, this._propertyValue[ property ].getCSS() );
		}
	},
	disable: function( effectID, property ) {
		if( this._enabled[ effectID ][ property ] ) {
			this._enabled[ effectID ][ property ] = false;

			if( property == 'opacity' )
				console.log( 'disable', property,  this._changeAmountForEffect[ effectID ][ property ].value );

			this._propertyValue[property].sub( this._changeAmountForEffect[ effectID ][ property ] );

			this._itemToEffect.css(property, this._propertyValue[property].getCSS());
		}
	},
	reset: function( effectID, property ) {
		this._propertyValue[property].sub(this._changeAmountForEffect[effectID][property]);
		
		this._changeAmountForEffect[effectID][property].reset();

		this._itemToEffect.css(property, this._propertyValue[property].getCSS());
	},
	resetAll: function( effectID ) {
		for (var i in this._changeAmountForEffect[effectID]) {
			this.reset(effectID, i);
		}
	},
	_setupProperty: function( effectID, property ) {
		var ParserClass = ParserLookUp[property];

		if (!this._propertiesWatching[property]) {
			if (ParserClass) {
				this._propertiesWatching[property] = true;

				var parser = new ParserClass( this._itemToEffect.css( property ) );

				this._propertyStartValue[ property ] = parser.getValue();
				this._propertyValue[ property ] = parser.getValue();
			} else {
				throw new Error('There is no parser defined for ' + property);
			}
		}

		this._enabled[ effectID ][ property ] = true;
		this._changeAmountForEffect[ effectID ][ property ] = this._propertyStartValue[ property ].getZero();
	}
});



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

			rVal += 'this._' + curProp + ' = arguments[ ' + i + ' ] == undefined ? ' + this._defaultValues[ i ] + ' : arguments[ ' + i + ' ];\n';
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

		rVal += '\t\treturn new ' + this._className + '('

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

		rVal += '\t\treturn new ' + this._className + '('

		for(var i = 0, len = this._properties.length - 1; i < len; i++ ) {
			rVal += 'this._' + this._properties[ i ] + ', ';	
		}

		rVal += 'this._' + this._properties[ i ] + ');\n},\n';

		return rVal;
	}
});






var builder = new PropertyClassBuilder( 'PropertyNumber' );
builder.addProperty( 'value', 0, 0 );
builder.setCSSDefinition( function() {
	return this.value;
});


var PropertyNumber = new Class( builder.build() );











var builder = new PropertyClassBuilder( 'PropertyColour' );
builder.addProperty( 'r', 0, 0 );
builder.addProperty( 'g', 0, 0 );
builder.addProperty( 'b', 0, 0 );
builder.addProperty( 'a', 1, 1 );
builder.setCSSDefinition( function() { 
	if( this.a < 1 ) {
		return 'rgba(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ', ' + Math.round( this.a ) + ')';
	} else {
		return 'rgb(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ')';
	}
} );


var PropertyColour = new Class( builder.build() );








var builder = new PropertyClassBuilder( 'PropertyFilter' );
builder.addProperty( 'blur', 0, 0 );
builder.addProperty( 'brightness', 0, 0 );
builder.addProperty( 'contrast', 1, 1 );
builder.addProperty( 'dropR', 0, 0 );
builder.addProperty( 'dropG', 0, 0 );
builder.addProperty( 'dropB', 0, 0 );
builder.addProperty( 'dropA', 0, 0 );
builder.addProperty( 'dropOffX', 0, 0 );
builder.addProperty( 'dropOffY', 0, 0 );
builder.addProperty( 'dropBlur', 0, 0 );
builder.addProperty( 'dropSpread', 0, 0 );
builder.addProperty( 'dropInset', 0, 0 );
builder.addProperty( 'grayScale', 0, 0 );
builder.addProperty( 'hueRotation', 0, 0 );
builder.addProperty( 'invert', 0, 0 );
builder.addProperty( 'opacity', 1, 1 );
builder.addProperty( 'saturate', 1, 1 );
builder.addProperty( 'sepia', 0, 0 );

builder.setCSSDefinition( function() {
	var rVal = '';

	if( this.blur > 0 ) {
		rVal += 'blur(' + Math.round( this.blur ) + 'px) ';
	}

	if( this.brightness > 0 ) {
		rVal += 'brightness(' + this.brightness + ') ';
	}

	if( this.contrast != 1 ) {
		rVal += 'contrast(' + this.contrast + ') ';
	}

	if( this.grayScale > 0 ) {
		rVal += 'grayscale(' + this.grayScale + ') ';
	}

	if( this.hueRotation != 0 && this.hueRotation != 360 ) {
		rVal += 'hue-rotate(' + this.hueRotation + 'deg) ';
	}

	if( this.invert > 0 ) {
		rVal += 'invert(' + this.invert + ') ';
	}

	if( this.opacity < 1 ) {
		rVal += 'opacity(' + this.opacity + ') ';
	}

	if( this.saturate != 1 ) {
		rVal += 'saturate(' + this.saturate + ') ';
	}

	if( this.sepia > 0 ) {
		rVal += 'sepia(' + this.sepia + ') ';
	}

	if( this.dropBlur > 0 || this.dropOffY != 0 || this.dropOffX != 0 ) {
		rVal += 'drop-shadow(' + this.dropOffX + 'px, ' + this.dropOffY + 'px ,' + this.dropBlur + 'px ' + this.dropSpread + 'px ';

		if( !this.dropInset ) {
			rVal += ')';
		} else {
			rVal += 'inset)';
		}
	}

	console.log( rVal );

	if( rVal == '' ) {
		return 'none';
	} else {
		return rVal;
	}
} );

var PropertyFilter = new Class( builder.build() );




var builder = new PropertyClassBuilder( 'PropertyBoxShadow' );
builder.addProperty( 'r', 0, 0 );
builder.addProperty( 'g', 0, 0 );
builder.addProperty( 'b', 0, 0 );
builder.addProperty( 'a', 0, 0 );
builder.addProperty( 'offX', 0, 0 );
builder.addProperty( 'offY', 0, 0 );
builder.addProperty( 'blur', 0, 0 );
builder.addProperty( 'spread', 0, 0 );
builder.addProperty( 'inset', 0, 0 );

builder.setCSSDefinition( function() {
	if( this.blur > 0 || this.offX != 0 || this.offY != 0 ) {
		var rVal = '';

		if( this.a < 1 ) {
			rVal += 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ') ';
		} else {
			rVal += 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ') ';
		}

		rVal += this.offX + 'px, ' + this.offY + 'px ,' + this.blur + 'px ' + this.spread + 'px ';

		if( this.dropInset ) {
			rVal += 'inset';
		}

		return rVal;
	} else {
		return 'none';
	}
});


var PropertyBoxShadow = new Class( builder.build() );

//NEED TO HANDLE COLOUR IN THE ABOCE



