var REGEX_VALUE_EXTENSION = /^(\d+\.?\d*)((px)?(%)?)$/;
var REGEX_VALUE_COLOUR_RGB = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\)$/

var Parser = new Class({
	initialize: function(cssValue) {
		this._cssValue = cssValue;

		this._parseCSSValue();
	},

	_cssValue: null,

	getValue: function() {
		throw new Error('You need to override this function');
	},
	_parseCSSValue: function() {
		throw new Error('You need to override this function');
	}
});

var ParseNumberValue = new Class({
	Extends: Parser,

	_value: 0,

	getValue: function() {
		return this._value;
	},
	_parseCSSValue: function() {
		var valueResult = REGEX_VALUE_EXTENSION.exec(this._cssValue);

		if (valueResult) this._value = parseFloat(valueResult[1]);
		else this._value = 0;
	}
});

var ParserColour = new Class({
	Extends: Parser,

	_value: null,

	getValue: function() {
		return this._value.clone();
	},
	_parseCSSValue: function() {
		if (REGEX_VALUE_COLOUR_RGB.test(this._cssValue)) {
			var valArr = REGEX_VALUE_COLOUR_RGB.exec(this._cssValue);

			this._value = new PropertyColour(parseFloat(valArr[1]), parseFloat(valArr[2]), parseFloat(valArr[3]), parseFloat(parseFloat(valArr[5]).toPrecision(2)));
		} else {
			throw new Error('Could not parse colour:', this._cssValue);
		}
	}
});

var ParserLookUp = {};
ParserLookUp['width'] = ParseNumberValue;
ParserLookUp['height'] = ParseNumberValue;
ParserLookUp['left'] = ParseNumberValue;
ParserLookUp['top'] = ParseNumberValue;
ParserLookUp['opacity'] = ParseNumberValue;
ParserLookUp['border-width'] = ParseNumberValue;
ParserLookUp['background-color'] = ParserColour;
ParserLookUp['color'] = ParserColour;