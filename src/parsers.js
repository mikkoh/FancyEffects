var REGEX_VALUE_EXTENSION = /^(-?\d+\.?\d*)((px)?(%)?)$/;
var REGEX_VALUE_COLOUR_RGB = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\)$/;
var REGEX_VALUE_BOX_SHADOW = /rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\) (-?\d+)px (-?\d+)px (-?\d+)px( (-?\d+)px( inset)?)?/;

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












var ParserBase = new Class({
	initialize: function(cssValue) {
		this._cssValue = cssValue;

		this._parseCSSValue();
	},

	_parserDefinition: null,
	_propertyType: null,
	_cssValue: null,
	_value: null,
	

	getValue: function() {
		return this._value.clone();
	},

	setParserDefinition: function( definition ) {
		this._parserDefinition = definition;
	},

	setPropertyType: function( propertyType ) {
		this._propertyType = propertyType;
	},

	_parseCSSValue: function() {
		var propNames = [];
		var propValues = [];

		this._getPropertyArgs( this._parserDefinition, propNames, propValues );

		//the following two lines are pretty nasty but it will construct a new property
		//then apply its constructor on it's self. Only way you can "apply" on a constructor
		this._value = Object.create( this._propertyType.prototype );
		this._value = ( this._propertyType.apply( this._value, propValues ) || this._value );
	},


	_getPropertyArgs: function( definition, propNames, propValues ) {
		//check if this definition level has its own regex
		var regex = definition.regex;
		var props = definition.props;
		
		//if no regex is defined there is an issue
		if( regex == undefined && props == undefined ) {
			throw new Error( 'Paser definition is malformed' );
		}

		if( regex != undefined ) {
			var regexValues = regex.exec( this._cssValue );
		}

		for( var i = 0, len = props.length; i < len; i++ ) {
			//check if theres another regex defined for this child property
			//if so we should recurse to parse out the values for this
			if( props[i].regex == undefined ) {
				
				//did we parse anything for values
				if( regexValues != undefined ) {
					var curVal = regexValues[ props[i].idx ];

					if( curVal == undefined && props[ i ].default !== undefined ) {
						curVal = props[ i ].default;
					}

					propNames.push( props[ i ].name );

					//we want to figure out what type of property we're parsing
					switch( props[ i ].type ) {
						case Number:
							var curNum = parseFloat( curVal );

							if( isNaN(curNum) )
								curNum = 0;

							propValues.push( curNum );
						break;

						case Boolean:
							propValues.push( curVal != undefined );
						break;

						default:
							propValues.push( curVal );
						break;
					}
				} else {
					propNames.push( props[ i ].name );
					propValues.push( undefined );
				}
			} else {
				//since there was a regex defined we should execute that regex as its own prop
				this._getPropertyArgs( props[i], propNames, propValues );
			}
		}
	}
});





function getNewParser( propertyType, parserDefinition ) {
	return new Class({
		Extends: ParserBase,

		initialize: function(cssValue) {
			this.setPropertyType( propertyType );
			this.setParserDefinition( parserDefinition );

			this.parent( cssValue );
		}	
	});
}





var definitionBasicNumber = {
	regex: /.+/, //anything will be parsed to a Number
	props: [
		{ name: 'value', idx: 0, type: Number }
	]
};

var definitionColour = {
	regex: REGEX_VALUE_COLOUR_RGB,
	props: [
		{ name: 'r', idx: 1, type: Number},
		{ name: 'b', idx: 2, type: Number},
		{ name: 'g', idx: 3, type: Number},
		{ name: 'a', idx: 5, type: Number, default: 1 }
	]
};

var definitionBoxShadow = {
	regex: REGEX_VALUE_BOX_SHADOW,
	props: [
		{ name: 'r', idx: 1, type: Number},
		{ name: 'b', idx: 2, type: Number},
		{ name: 'g', idx: 3, type: Number},
		{ name: 'a', idx: 5, type: Number, default: 1 },
		{ name: 'offX', idx: 6, type: Number, default: 0 },
		{ name: 'offY', idx: 7, type: Number, default: 0 },
		{ name: 'blur', idx: 7, type: Number, default: 0 },
		{ name: 'spread', idx: 10, type: Number, default: 0 },
		{ name: 'inset', idx: 11, type: Boolean}
	]
};

var definitionFilter = {
	props: [
		{ regex: REGEX_VALUE_FILTER_BLUR, 
		  props: [ {name: 'blur', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_BRIGHTNESS, 
		  props: [ {name: 'brightness', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_CONTRAST, 
		  props: [ {name: 'contrast', idx: 1, type: Number, default: 1 } ] },

		//note that currently spread and inset are not supported for filter
		{
			regex: REGEX_VALUE_BOX_SHADOW,
			props: [
				{ name: 'r', idx: 1, type: Number},
				{ name: 'b', idx: 2, type: Number},
				{ name: 'g', idx: 3, type: Number},
				{ name: 'a', idx: 5, type: Number, default: 1 },
				{ name: 'offX', idx: 6, type: Number, default: 0 },
				{ name: 'offY', idx: 7, type: Number, default: 0 },
				{ name: 'blur', idx: 7, type: Number, default: 0 }
			]
		},

		{ regex: REGEX_VALUE_FILTER_GRAY_SCALE, 
		  props: [ {name: 'grayScale', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_HUE_ROTATION, 
		  props: [ {name: 'hueRotation', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_INVERT, 
		  props: [ {name: 'invert', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_OPACITY, 
		  props: [ {name: 'opacity', idx: 1, type: Number, default: 1 } ] },

		{ regex: REGEX_VALUE_FILTER_SATURATE, 
		  props: [ {name: 'saturate', idx: 1, type: Number, default: 1 } ] },

		{ regex: REGEX_VALUE_FILTER_SEPIA, 
		  props: [ {name: 'sepia', idx: 1, type: Number, default: 0 } ] }
	]
};






var ParseNumberValue = getNewParser( PropertyNumber, definitionBasicNumber );
var ParseNumberValueWhole = getNewParser( PropertyNumberWhole, definitionBasicNumber );
var ParserColour = getNewParser( PropertyColour, definitionColour );
var ParserFilter = getNewParser( PropertyFilter, definitionFilter );
var ParseDropShadow = getNewParser( PropertyBoxShadow, definitionBoxShadow );


var ParserLookUp = {};
ParserLookUp['width'] = ParseNumberValueWhole;
ParserLookUp['height'] = ParseNumberValueWhole;
ParserLookUp['left'] = ParseNumberValueWhole;
ParserLookUp['top'] = ParseNumberValueWhole;
ParserLookUp['opacity'] = ParseNumberValue;
ParserLookUp['border-width'] = ParseNumberValueWhole;
ParserLookUp['color'] = ParserColour;
ParserLookUp['margin-top'] = ParseNumberValueWhole;
ParserLookUp['margin-right'] = ParseNumberValueWhole;
ParserLookUp['margin-bottom'] = ParseNumberValueWhole;
ParserLookUp['margin-left'] = ParseNumberValueWhole;
ParserLookUp['background-color'] = ParserColour;
ParserLookUp['-webkit-filter'] = ParserFilter;
ParserLookUp['box-shadow'] = ParseDropShadow;