var REGEX_VALUE_EXTENSION = /^(-?\d+\.?\d*)((px)?(%)?)$/;
var REGEX_VALUE_COLOUR_RGB = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\)$/;
var REGEX_VALUE_BOX_SHADOW = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\) (-?\d+)px (-?\d+)px (-?\d+)px( (-?\d+)px( inset)?)?$/;

var REGEX_VALUE_FILTER_BLUR = /blur\((\d+)px\)/;
var REGEX_VALUE_FILTER_BRIGHTNESS = /brightness\((-?\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_CONTRAST = /contrast\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_DROP_SHADOW = /drop-shadow\((.+)\)/;
var REGEX_VALUE_FILTER_GRAY_SCALE = /grayscale\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_HUE_ROTATION = /hue-rotate\((\d)+deg\)/;
var REGEX_VALUE_FILTER_INVERT = /invert\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_OPACITY = /opacity\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_SATURATE = /saturate\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_SEPIA = /sepia\((\d+\.?\d*)\)/;

var Parser = new Class({
	initialize: function(cssValue) {
		this._cssValue = cssValue;

		this._parseCSSValue();
	},

	_cssValue: null,
	_value: null,

	getValue: function() {
		return this._value.clone();
	},
	getZeroProperty: function() {
		throw new Error('You need to override this function');
	},
	_parseCSSValue: function() {
		throw new Error('You need to override this function');
	}
});

var ParseNumberValue = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var valueResult = REGEX_VALUE_EXTENSION.exec(this._cssValue);

		if( valueResult != null )
			this._value = new PropertyNumber( parseFloat( valueResult[1]) );
		else
			this._value = new PropertyNumber();
	}
});

ParseNumberValue.getZeroProperty = function() {
	return new PropertyNumber(0);
};


var ParserColour = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var valArr = REGEX_VALUE_COLOUR_RGB.exec(this._cssValue);

		if (valArr != undefined) {
			//we're doing something funky here with ALPHA because jquery may have a bug
			//when css is set to 0.5 jQuery returns 0.498046875 which is 127.5/255
			//we just drop the precision slightly in hopes that it will be more acurate
			//I know it's sort of bad
			this._value = new PropertyColour( parseFloat(valArr[1]), 
											  parseFloat(valArr[2]), 
											  parseFloat(valArr[3]), 
											  parseFloat(parseFloat(valArr[5]).toPrecision(2)) );
		} else {
			this._value = new PropertyColour();
		}
	}
});

ParserColour.getZeroProperty = function() {
	return new PropertyColour(0, 0, 0, 0);
};



var ParserFilter = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var blur = REGEX_VALUE_FILTER_BLUR.exec(this._cssValue);
		var brightness = REGEX_VALUE_FILTER_BRIGHTNESS.exec(this._cssValue);
		var contrast = REGEX_VALUE_FILTER_CONTRAST.exec(this._cssValue);
		var grayScale = REGEX_VALUE_FILTER_GRAY_SCALE.exec(this._cssValue);
		var hueRotation = REGEX_VALUE_FILTER_HUE_ROTATION.exec(this._cssValue);
		var invert = REGEX_VALUE_FILTER_INVERT.exec(this._cssValue);
		var opacity = REGEX_VALUE_FILTER_OPACITY.exec(this._cssValue);
		var saturate = REGEX_VALUE_FILTER_SATURATE.exec(this._cssValue);
		var sepia = REGEX_VALUE_FILTER_SEPIA.exec(this._cssValue);

		var dropShadow = REGEX_VALUE_FILTER_DROP_SHADOW.exec(this._cssValue);
		var dropShadowVal = undefined;

		if(dropShadow) {
			dropShadowVal = (new ParseDropShadow(dropShadow[1])).getValue();
		} else {
			dropShadowVal = new PropertyBoxShadow();
		}

		this._value = new PropertyFilter(blur==undefined ? 0 : parseFloat(blur[1]),
										 brightness == undefined ? 0 : parseFloat(brightness[1]),
										 contrast == undefined ? 1 : parseFloat(contrast[1]),
										 dropShadowVal,
										 grayScale == undefined ? 0 : parseFloat(grayScale[1]),
										 hueRotation == undefined ? 0 : parseFloat(hueRotation[1]),
										 invert == undefined ? 0 : parseFloat(invert[1]),
										 opacity == undefined ? 1 : parseFloat(opacity[1]),
										 saturate == undefined ? 1 : parseFloat(saturate[1]),
										 sepia == undefined ? 0 : parseFloat(sepia[1]));
	}
});

ParserFilter.getZeroProperty = function() {
	return new PropertyFilter(0, 0, 0, ParseDropShadow.getZeroProperty(), 0, 0, 0, 0, 0, 0);
};


var ParseDropShadow = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var valArr = REGEX_VALUE_BOX_SHADOW.exec(this._cssValue);
		
		if ( valArr ) {
			this._value = new PropertyBoxShadow( valArr[1], //r
												 valArr[2], //g
												 valArr[3], //b
												 valArr[5], //a
												 valArr[6], //offX
												 valArr[7], //offY
												 valArr[8], //blur
												 valArr[10], //spread
												 valArr[11] ); //inset
		} else {
			this._value = new PropertyBoxShadow();
		}
	}
});

ParseDropShadow.getZeroProperty=function() {
		return new PropertyBoxShadow( 0, 0, 0, 0, 0, 0, 0, 0 );
};

var ParserLookUp = {};
ParserLookUp['width'] = ParseNumberValue;
ParserLookUp['height'] = ParseNumberValue;
ParserLookUp['left'] = ParseNumberValue;
ParserLookUp['top'] = ParseNumberValue;
ParserLookUp['opacity'] = ParseNumberValue;
ParserLookUp['border-width'] = ParseNumberValue;
ParserLookUp['color'] = ParserColour;
ParserLookUp['background-color'] = ParserColour;
ParserLookUp['-webkit-filter'] = ParserFilter;
ParserLookUp['box-shadow'] = ParseDropShadow;