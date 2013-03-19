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
	initialize: function() {
		this._properties = [];
		this._value = [];
		this._defaultValues = [];
	},

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
				  this._getGetCSSStr();


		src = src.substring( 0, src.length-2 );

		ob = eval( '({' + src + '})' );

		return ob;
	},

	_getConstructorStr: function() {
		var rVal = 'initialize: function() {\n'

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			rVal += 'this._' + this._properties[ i ] + ' = arguments[ '+i+' ] == undefined ? ' + this._defaultValues[ i ] + ' : arguments[ '+i+' ];\n';
			rVal += 'this.__defineGetter__("' + this._properties[ i ] + '", this.get' + this._properties[ i ] + ');\n';
			rVal += 'this.__defineSetter__("' + this._properties[ i ] + '", this.set' + this._properties[ i ] + ');\n\n';
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
		var rVal = '\tgetZero: function(otherItem) {\n';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\t\tthis._' + curProp + ' = 0;\n';
		}
		
		rVal += '\t\treturn this;\n \t},\n';	

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

	_getGetCSSStr: function() {
		var rVal = '\tgetCSS: function() {\n';

		var cssDef = this._cssDefinition.css;
		var alternatives = this._cssDefinition.alternatives;

		var regex = /%(\w+)%/g;
		var valArr = null;

		//update the definitions to use properties from this class
		while( valArr = regex.exec( cssDef ) ) {
			var curProp = valArr[ 1 ];

			cssDef = cssDef.replace( valArr[0], '" + this.' + valArr[1] + ' + "');
		}

		//check if we have alternative css
		if( alternatives ) {
			for( var i = 0, len = alternatives.length; i < len ; i++ ) {
				var curCSS = alternatives[ i ].css;
				var curValuesToCheck = alternatives[ i ].values;
				var ifStatement = '';

				//update the definitions to use properties from this class
				while( valArr = regex.exec( curCSS ) ) {
					var curProp = valArr[ 1 ];

					curCSS = curCSS.replace( valArr[0], '" + this.' + valArr[1] + ' + "');
				}

				for( var j = 0, lenJ = curValuesToCheck.length; j < lenJ; j++ ) {
					var altValue = curValuesToCheck[ j ];

					ifStatement += 'this.' + altValue.name + ' == ' + altValue.value + ' &&';
				}

				ifStatement = ifStatement.substring(0, ifStatement.length - 2);

				if( i > 0) {
					rVal += '\t\telse if( ' + ifStatement + ') { return "' + curCSS + '"; }'
				} else {
					rVal += '\t\tif( ' + ifStatement + ') { return "' + curCSS + '"; }'
				}
			}

			rVal += '\t\telse { return "' + cssDef + '" };\n'
		} else {
			rVal += '\t\treturn "' + cssDef + '";\n'
		}


		rVal += '},\n';

		return rVal;
	}
});





var builder = new PropertyClassBuilder();
builder.addProperty( 'r', 0, 0 );
builder.addProperty( 'g', 0, 0 );
builder.addProperty( 'b', 0, 0 );
builder.addProperty( 'a', 1, 1 );
builder.setCSSDefinition( { css: 'rgba(%r%, %g%, %b%, %a%)', 
							alternatives: [
								{ css: 'rgb(%r%, %g%, %b%)', values: [{ name: 'a', value: 1 }] },
								{ css: 'transparent', values: [{ name: 'a', value: 0 }] }
							]});

var ColourProperty = new Class( builder.build() );

var col = new ColourProperty();

console.log( col.getCSS() );




/*




var Property = new Class({
	onPropertyChange: null,

	initialize: function() {
		this.onPropertyChange = new Signal();

		this._properties = [];
		this._defaultValues = {};
	},

	_properties: null,
	_defaultValues: null, 

	addProperty: function( name, value, defaultValue ) {
		var privateName = '_' + name;
		var getterName = 'get' + name;
		var setterName = 'set' + name;

		this._defaultValues[ privateName ] = defaultValue;
		this[ privateName ] = value;
		this._properties.push( privateName );

		this[ getterName ] = function() {
			return this[ privateName ];
		};

		this[ setterName ] = function( value ) {
			this[ privateName ] = value;

			this.onPropertyChange.dispatch();
		};

		this.__defineGetter__( name, this[ getterName ] );
		this.__defineSetter__( name, this[ setterName ] );
	}

	add: function(otherItem) {
		for( var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			this[ curProp ] += otherItem[ curProp ];
		}

		return this;
	},
	sub: function(otherItem) {
		
	},
	mulScalar: function(scalar) {
		
	},
	equals: function(otherItem) {
	
	},
	reset: function() {
		for( var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			this[ curProp ] = this._defaultValues[ curProp ];
		}

		return this;
	},
	getZero: function() {
		var args = [];
		var rVal = Object.create( Property );
	
		for( var i = 0, len = this._properties.length; i < len; i++ ) {
			args[ i ] = 0;
		}

		return ( this._propertyType.apply( this._value, propValues ) || rVal );
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		throw new Error('You must override this function');
		return this;
	},
	getCSS: function() {
		throw new Error('You must override this function');
	},
	clone: function() {
		var args = [];
		var rVal = Object.create( Property );
	
		for( var i = 0, len = this._properties.length; i < len; i++ ) {
			args[ i ] = this[ this._properties[ i ] ];
		}

		return ( this._propertyType.apply( this._value, propValues ) || rVal );
	},
	toString: function() {
		var rVal = '';

		for( var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += curProp + '=' this[ curProp ];
		}

		return rVal;
	}
});






// var Property = new Class({
// 	onPropertyChange: null,

// 	initialize: function() {
// 		this.onPropertyChange = new Signal();
// 	},

// 	add: function(otherItem) {
// 		throw new Error('You must override this function');
// 		return this;
// 	},
// 	sub: function(otherItem) {
// 		throw new Error('You must override this function');
// 		return this;
// 	},
// 	mulScalar: function(scalar) {
// 		throw new Error('You must override this function');
// 		return this;
// 	},
// 	equals: function(otherItem) {
// 		throw new Error('You must override this function');
// 		return this;
// 	},
// 	getChange: function(percentage, curValue, startValue, endValue) {
// 		throw new Error('You must override this function');
// 		return this;
// 	},
// 	getCSS: function() {
// 		throw new Error('You must override this function');
// 	},
// 	clone: function() {
// 		throw new Error('You must override this function');
// 	}
// });

var PropertyNumber = new Class({
	Extends: Property,

	initialize: function(value) {
		this.parent();

		this.__defineGetter__('value', this.getValue);
		this.__defineSetter__('value', this.setValue);

		this._value = value == undefined ? 0 : value;
	},

	_value: 0,

	getValue: function() {
		return this._value;
	},
	setValue: function(value) {
		this._value = value;
		this.onPropertyChange.dispatch();
	},
	add: function(otherItem) {
		this._value += otherItem.value;

		return this;
	},
	sub: function(otherItem) {
		this._value -= otherItem.value;

		return this;
	},
	mulScalar: function(scalar) {
		this._value *= scalar;

		return this;
	},
	equals: function(otherItem) {
		this._value = otherItem.value;

		return this;
	},
	reset: function() {
		this._value = 0;
	},
	getZero: function() {
		return new PropertyNumber( 0 );
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this._value = (endValue.value - startValue.value) * percentage + startValue.value;

		this._value -= curValue.value;

		return this;
	},
	getCSS: function() {
		return this._value;
	},
	clone: function() {
		return new PropertyNumber(this._value);
	}
});


var PropertyColour = new Class({
	Extends: Property,

	initialize: function(r, g, b, a) {
		this.parent();

		this.__defineGetter__('r', this.getR);
		this.__defineGetter__('g', this.getG);
		this.__defineGetter__('b', this.getB);
		this.__defineGetter__('a', this.getA);

		this.__defineSetter__('r', this.setR);
		this.__defineSetter__('g', this.setG);
		this.__defineSetter__('b', this.setB);
		this.__defineSetter__('a', this.setA);

		this._r = r == undefined ? 0 : parseFloat(r);
		this._g = g == undefined ? 0 : parseFloat(g);
		this._b = b == undefined ? 0 : parseFloat(b);
		this._a = a == undefined || isNaN(a) ? 1 : parseFloat(a);
	},

	_r: 0,
	_g: 0,
	_b: 0,
	_a: 1,

	getR: function() {
		return this._r;
	},
	getG: function() {
		return this._g;
	},
	getB: function() {
		return this._b;
	},
	getA: function() {
		return this._a;
	},
	setR: function(value) {
		this._r = value;

		this.onPropertyChange.dispatch();
	},
	setG: function(value) {
		this._g = value;

		this.onPropertyChange.dispatch();
	},
	setB: function(value) {
		this._b = value;

		this.onPropertyChange.dispatch();
	},
	setA: function(value) {
		this._a = value;

		this.onPropertyChange.dispatch();
	},
	add: function(otherItem) {
		this._r += otherItem.r;
		this._g += otherItem.g;
		this._b += otherItem.b;
		this._a += otherItem.a;

		return this;
	},
	sub: function(otherItem) {
		this._r -= otherItem.r;
		this._g -= otherItem.g;
		this._b -= otherItem.b;
		this._a -= otherItem.a;

		return this;
	},
	mulScalar: function(scalar) {
		this._r *= scalar;
		this._g *= scalar;
		this._b *= scalar;
		this._a *= scalar;

		return this;
	},
	equals: function(startVal) {
		this._r = startVal.r;
		this._g = startVal.g;
		this._b = startVal.b;
		this._a = startVal.a;

		return this;
	},
	reset: function() {
		this._r = 0;
		this._g = 0;
		this._b = 0;
		this._a = 1;
	},
	getZero: function() {
		return new PropertyColour( 0, 0, 0, 0 );
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this._r = (endValue.r - startValue.r) * percentage + startValue.r;
		this._g = (endValue.g - startValue.g) * percentage + startValue.g;
		this._b = (endValue.b - startValue.b) * percentage + startValue.b;
		this._a = (endValue.a - startValue.a) * percentage + startValue.a;

		this._r -= curValue.r;
		this._g -= curValue.g;
		this._b -= curValue.b;
		this._a -= curValue.a;

		return this;
	},
	getCSS: function() {
		if (this.a == 1) {
			return 'rgb(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ')';
		} else {
			return 'rgba(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ', ' + this.a + ')';
		}
	},
	clone: function() {
		var rVal = new PropertyColour(this.r, this.g, this.b, this.a);

		return rVal;
	},
	toString: function() {
		return this._r + ', ' + this._g + ', ' + this._b + ', ' + this._a;
	}
});



var PropertyFilter = new Class({
	Extends: Property,

	initialize: function(blur, brightness, contrast, dropR, dropG, dropB, dropA, dropOffX, dropOffY, dropBlur, dropSpread, dropInset, grayScale, hueRotation, invert, opacity, saturate, sepia) {
		this.parent();

		this.__defineGetter__('blur', this.getBlur);
		this.__defineGetter__('brightness', this.getBrightness);
		this.__defineGetter__('contrast', this.getContrast);
		this.__defineGetter__('dropShadow', this.getDropShadow);
		this.__defineGetter__('grayScale', this.getGrayScale);
		this.__defineGetter__('hueRotation', this.getHueRotation);
		this.__defineGetter__('invert', this.getInvert);
		this.__defineGetter__('opacity', this.getOpacity);
		this.__defineGetter__('saturate', this.getSaturate);
		this.__defineGetter__('sepia', this.getSepia);

		this.__defineSetter__('blur', this.setBlur);
		this.__defineSetter__('brightness', this.setBrightness);
		this.__defineSetter__('contrast', this.setContrast);
		this.__defineSetter__('dropShadow', this.setDropShadow);
		this.__defineSetter__('grayScale', this.setGrayScale);
		this.__defineSetter__('hueRotation', this.setHueRotation);
		this.__defineSetter__('invert', this.setInvert);
		this.__defineSetter__('opacity', this.setOpacity);
		this.__defineSetter__('saturate', this.setSaturate);
		this.__defineSetter__('sepia', this.setSepia);

		this._blur = blur == undefined ? 0 : blur;
		this._brightness = brightness == undefined ? 0 : brightness;
		this._contrast = contrast == undefined ? 1 : contrast;
		this._dropShadow = new PropertyBoxShadow(dropR, dropG, dropB, dropA, dropOffX, dropOffY, dropBlur, dropSpread, dropInset);
		this._grayScale = grayScale == undefined ? 0 : grayScale;
		this._hueRotation = hueRotation == undefined ? 0 : hueRotation;
		this._invert = invert == undefined ? 0 : invert;
		this._opacity = opacity == undefined ? 1 : opacity;
		this._saturate = saturate == undefined ? 1 : saturate;
		this._sepia = sepia == undefined ? 0 : sepia;
	},

	_blur: 0,
	_brightness: 0,
	_contrast: 1,
	_dropShadow: null,
	_grayScale: 0,
	_hueRotation: 0,
	_invert: 0,
	_opacity: 1,
	_saturate: 1,
	_sepia: 0,

	getBlur: function() {
		return this._blur;
	},
	getBrightness: function() {
		return this._brightness;
	},
	getContrast: function() {
		return this._contrast;
	},
	getDropShadow: function() {
		return this._dropShadow;
	},
	getGrayScale: function() {
		return this._grayScale;
	},
	getHueRotation: function() {
		return this._hueRotation;
	},
	getInvert: function() {
		return this._invert;
	},
	getOpacity: function() {
		return this._opacity;
	},
	getSaturate: function() {
		return this._saturate;
	},
	getSepia: function() {
		return this._sepia;
	},
	setPropertyChange: function(value) {
		this.parent(value);

		this.dropShadow.onPropertyChange = value;
	},
	setBlur: function(value) {
		this._blur = value;

		this.onPropertyChange.dispatch();
	},
	setBrightness: function(value) {
		this._brightness = value;
		this.onPropertyChange.dispatch();
	},
	setContrast: function(value) {
		this._contrast = value;
		this.onPropertyChange.dispatch();
	},
	setDropShadow: function(value) {
		this._dropShadow = value;
		this.onPropertyChange.dispatch();
	},
	setGrayScale: function(value) {
		this._grayScale = value;

		this.onPropertyChange.dispatch();
	},
	setHueRotation: function(value) {
		this._hueRotation = value;
		this.onPropertyChange.dispatch();
	},
	setInvert: function(value) {
		this._invert = value;
		this.onPropertyChange.dispatch();
	},
	setOpacity: function(value) {
		this._opacity = value;
		this.onPropertyChange.dispatch();
	},
	setSaturate: function(value) {
		this._saturate = value;
		this.onPropertyChange.dispatch();
	},
	setSepia: function(value) {
		this._sepia = value;
		this.onPropertyChange.dispatch();
	},
	add: function(otherItem) {
		this._blur += otherItem.blur;
		this._brightness += otherItem.brightness;
		this._contrast += otherItem.contrast;
		this._grayScale += otherItem.grayScale;
		this._hueRotation += otherItem.hueRotation;
		this._invert += otherItem.invert;
		this._opacity += otherItem.opacity;
		this._saturate += otherItem.saturate;
		this._sepia += otherItem.sepia;

		this.dropShadow.add(otherItem.dropShadow);

		return this;
	},
	sub: function(otherItem) {
		this._blur -= otherItem.blur;
		this._brightness -= otherItem.brightness;
		this._contrast -= otherItem.contrast;
		this._grayScale -= otherItem.grayScale;
		this._hueRotation -= otherItem.hueRotation;
		this._invert -= otherItem.invert;
		this._opacity -= otherItem.opacity;
		this._saturate -= otherItem.saturate;
		this._sepia -= otherItem.sepia;

		this.dropShadow.sub(otherItem.dropShadow);

		return this;
	},
	mulScalar: function(scalar) {
		this._blur *= scalar;
		this._brightness *= scalar;
		this._contrast *= scalar;
		this._grayScale *= scalar;
		this._hueRotation *= scalar;
		this._invert *= scalar;
		this._opacity *= scalar;
		this._saturate *= scalar;
		this._sepia *= scalar;

		return this;
	},
	equals: function(otherItem) {
		this._blur = otherItem.blur;
		this._brightness = otherItem.brightness;
		this._contrast = otherItem.contrast;
		this._grayScale = otherItem.grayScale;
		this._hueRotation = otherItem.hueRotation;
		this._invert = otherItem.invert;
		this._opacity = otherItem.opacity;
		this._saturate = otherItem.saturate;
		this._sepia = otherItem.sepia;

		return this;
	},
	reset: function() {
		this._blur = 0;
		this._brightness = 0;
		this._contrast = 1;
		this._grayScale = 0;
		this._hueRotation = 0;
		this._invert = 0;
		this._opacity = 1;
		this._saturate = 1;
		this._sepia = 0;

		this._dropShadow.reset();
	},
	getZero: function() {
		return new PropertyFilter(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, 0, 0, 0, 0, 0, 0);
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this._blur = (endValue.blur - startValue.blur) * percentage + startValue.blur;
		this._brightness = (endValue.brightness - startValue.brightness) * percentage + startValue.brightness;
		this._contrast = (endValue.contrast - startValue.contrast) * percentage + startValue.contrast;
		this._grayScale = (endValue.grayScale - startValue.grayScale) * percentage + startValue.grayScale;
		this._hueRotation = (endValue.hueRotation - startValue.hueRotation) * percentage + startValue.hueRotation;
		this._invert = (endValue.invert - startValue.invert) * percentage + startValue.invert;
		this._opacity = (endValue.opacity - startValue.opacity) * percentage + startValue.opacity;
		this._saturate = (endValue.saturate - startValue.saturate) * percentage + startValue.saturate;
		this._sepia = (endValue.sepia - startValue.sepia) * percentage + startValue.sepia;

		this._blur -= curValue.blur;
		this._brightness -= curValue.brightness;
		this._contrast -= curValue.contrast;
		this._grayScale -= curValue.grayScale;
		this._hueRotation -= curValue.hueRotation;
		this._invert -= curValue.invert;
		this._opacity -= curValue.opacity;
		this._saturate -= curValue.saturate;
		this._sepia -= curValue.sepia;

		this.dropShadow.getChange(percentage, curValue.dropShadow, startValue.dropShadow, endValue.dropShadow);

		return this;
	},
	getCSS: function() {
		var rVal = '';

		if (this._blur > 0) {
			rVal += 'blur(' + Math.round(this._blur) + 'px) ';
		}

		if (this._brightness > 0) {
			rVal += 'brightness(' + this._brightness + ') ';
		}

		if (this._contrast != 1) {
			rVal += 'contrast(' + this._contrast + ') ';
		}

		if (this._grayScale > 0) {
			rVal += 'grayscale(' + this._grayScale + ') ';
		}

		if (this._hueRotation > 0 && this._hueRotation < 360) {
			rVal += 'hue-rotate(' + this._hueRotation + 'deg) ';
		}

		if (this._invert > 0) {
			rVal += 'invert(' + this._invert + ') ';
		}

		if (this._opacity < 1) {
			rVal += 'opacity(' + this._opacity + ') ';
		}

		if (this._saturate != 1) {
			rVal += 'saturate(' + this._saturate + ') ';
		}

		if (this._sepia > 0) {
			rVal += 'sepia(' + this._sepia + ')';
		}

		if (this._dropShadow.isNotDefault()) rVal += 'drop-shadow(' + this._dropShadow.getCSS() + ') ';

		if (rVal == '') rVal = 'none';

		return rVal;
	},
	clone: function() {
		return new PropertyFilter(this._blur,
		this._brightness,
		this._contrast,
		this._dropShadow.clone(),
		this._grayScale,
		this._hueRotation,
		this._invert,
		this._opacity,
		this._saturate,
		this._sepia);
	}
});


var PropertyBoxShadow = new Class({
	Extends: PropertyColour,

	initialize: function(r, g, b, a, offX, offY, blur, spread, inset) {
		this.__defineGetter__('offX', this.getOffX);
		this.__defineGetter__('offY', this.getOffY);
		this.__defineGetter__('blur', this.getBlur);
		this.__defineGetter__('spread', this.getSpread);
		this.__defineGetter__('inset', this.getInset);
		this.__defineSetter__('offX', this.setOffX);
		this.__defineSetter__('offY', this.setOffY);
		this.__defineSetter__('blur', this.setBlur);
		this.__defineSetter__('spread', this.setSpread);
		this.__defineSetter__('inset', this.setInset);

		this._offX = offX == undefined ? 0 : parseFloat(offX);
		this._offY = offY == undefined ? 0 : parseFloat(offY);
		this._blur = blur == undefined ? 0 : parseFloat(blur);
		this._spread = spread == undefined ? 0 : parseFloat(spread);
		this._inset = inset;

		this.parent(r, g, b, a);
	},

	_offX: 0,
	_offY: 0,
	_blur: 0,
	_spread: 0,
	_inset: false,

	getOffX: function() {
		return this._offX
	},
	getOffY: function() {
		return this._offY
	},
	getBlur: function() {
		return this._blur
	},
	getSpread: function() {
		return this._spread
	},
	getInset: function() {
		return this._inset
	},
	setOffX: function(value) {
		this._offX = value;
		this.onPropertyChange.dispatch();
	},
	setOffY: function(value) {
		this._offY = value;
		this.onPropertyChange.dispatch();
	},
	setBlur: function(value) {
		this._blur = value;
		this.onPropertyChange.dispatch();
	},
	setSpread: function(value) {
		this._spread = value;
		this.onPropertyChange.dispatch();
	},
	setInset: function(value) {
		this._inset = value;
		this.onPropertyChange.dispatch();
	},
	isNotDefault: function() {
		return this._offX != 0 || this._offY != 0 || this._blur != 0 || this._spread != 0;
	},
	add: function(otherItem) {
		this.parent(otherItem);

		this._offX += otherItem.offX;
		this._offY += otherItem.offY;
		this._blur += otherItem.blur;
		this._spread += otherItem.spread;

		return this;
	},
	sub: function(otherItem) {
		this.parent(otherItem);

		this._offX -= otherItem.offX;
		this._offY -= otherItem.offY;
		this._blur -= otherItem.blur;
		this._spread -= otherItem.spread;

		return this;
	},
	mulScalar: function(scalar) {
		this._offX *= scalar;
		this._offY *= scalar;
		this._blur *= scalar;
		this._spread *= scalar;

		return this;
	},
	equals: function(otherItem) {
		this.parent(otherItem);

		this._offX = otherItem.offX;
		this._offY = otherItem.offY;
		this._blur = otherItem.blur;
		this._spread = otherItem.spread;

		return this;
	},
	reset: function() {
		this._offX = 0;
		this._offY = 0;
		this._blur = 0;
		this._spread = 0;
		this._inset = false;
	},
	getZero: function() {
		return new PropertyBoxShadow(0, 0, 0, 0, 0, 0, 0, 0, false);
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this.parent(percentage, curValue, startValue, endValue);

		this._offX = (endValue.offX - startValue.offX) * percentage + startValue.offX;
		this._offY = (endValue.offY - startValue.offY) * percentage + startValue.offY;
		this._blur = (endValue.blur - startValue.blur) * percentage + startValue.blur;
		this._spread = (endValue.spread - startValue.spread) * percentage + startValue.spread;

		this._offX -= curValue.offX;
		this._offY -= curValue.offY;
		this._blur -= curValue.blur;
		this._spread -= curValue.spread;

		return this;
	},
	getCSS: function() {
		var rVal = this.parent() + ' ';

		rVal += Math.round(this.offX) + 'px ' + Math.round(this.offY) + 'px ';

		if (this.blur > 0) rVal += Math.round(this.blur) + 'px ';

		if (this.spread > 0) rVal += Math.round(this.spread) + 'px ';

		if (this.inset) rVal += 'inset';

		return rVal;
	},
	clone: function() {
		return new PropertyBoxShadow(this._r,
		this._g,
		this._b,
		this._a,
		this._offY,
		this._offY,
		this._blur,
		this._spread,
		this._inset);
	}
});
*/