var Effect = new Class({
	initialize: function(itemToEffect) {
		this._effects = [];

		if (itemToEffect) this.setItemToEffect(itemToEffect);

		this.__proto__.__defineSetter__('percentage', this.setPercentage);
		this.__proto__.__defineGetter__('percentage', this.getPercentage);
		this.__proto__.__defineGetter__('id', this.getId);
	},

	_id: 'Effect',
	_itemToEffect: null,
	_itemProperties: null,
	_percentage: 0,
	_effects: null,

	getId: function() {
		return this._id;
	},
	setItemToEffect: function(itemToEffect, itemProperties) {
		this._itemToEffect = itemToEffect;

		if (itemProperties) this._itemProperties = itemProperties;
		else this._itemProperties = new ItemProperties(itemToEffect);
	},
	getPercentage: function() {
		return this._percentage;
	},
	setPercentage: function(value) {
		this._percentage = value;

		for (var i = 0; i < this._effects.length; i++) {
			this._effects[i].setPercentage(value);
		}
	},
	add: function(effect) {
		this._effects.push(effect);
		effect.setItemToEffect(this._itemToEffect, this._itemProperties);
		effect.percentage = this.percentage;
	},
	remove: function(effect) {

	}
});


var EffectChangeProp = new Class({
	Extends: Effect,
	initialize: function() {
		/*
		ONE ARGUMENT:
						itemToEffect
		TWO ARGUMENTS: 
						itemToEffect, propertyToEffect
						propertyToEffect, endValue

		THREE ARUGMENTS: 
					 	itemToEffect, propertyToEffect, endValue
					 	propertyToEffect, startValue, endValue
						

		FOUR ARGUMENTS: 
						itemToEffect, propertyToEffect, startValue, endValue
		*/

		if (arguments[0] instanceof jQuery) {
			if (arguments.length == 3) {
				this._startValue = arguments[1];
				this._endValue = arguments[2];
			} else if (arguments.length == 2) {
				this._endValue = arguments[1];
			}

			this.parent(arguments[0]);
		} else {
			if (arguments.length == 2) {
				this._startValue = arguments[0];
				this._endValue = arguments[1];
			} else if (arguments.length == 1) {
				this._endValue = arguments[0];
			}

			this.parent();
		}


		this.__defineGetter__('start', this.getStartValue);
		this.__defineSetter__('start', this.setStartValue);
		this.__defineGetter__('end', this.getEndValue);
		this.__defineSetter__('end', this.setEndValue);
	},

	_startValue: null,
	_endValue: null,
	_propertyToEffect: null,

	setItemToEffect: function(itemToEffect, itemProperties) {
		this.parent(itemToEffect, itemProperties);

		this._itemProperties.setupEffect(this, this._propertyToEffect);
	},
	getStartValue: function() {
		return this._startValue;
	},
	setStartValue: function(value) {
		this._startValue = value;

		this.setPercentage(this._percentage);
	},
	getEndValue: function() {
		return this._endValue;
	},
	setEndValue: function(value) {
		this._endValue = value;

		this.setPercentage(this._percentage);
	}
});


var EffectChangePropNumber = new Class({
	Extends: EffectChangeProp,

	setPercentage: function(value) {
		this.parent(value);

		var cValue = this._itemProperties.get(this._propertyToEffect);
		var nValue = (this._endValue - this._startValue) * value + this._startValue;

		this._itemProperties.change(this.id, this._propertyToEffect, nValue - cValue);
	},
	setItemToEffect: function(itemToEffect, itemProperties) {
		this.parent(itemToEffect, itemProperties);

		if (this._startValue == null) this._startValue = this._itemProperties.getStart(this._propertyToEffect);

		if (this._endValue == null) this._endValue = this._itemProperties.getStart(this._propertyToEffect);
	}
});


var EffectChangePropAdvanced = new Class({
	Extends: EffectChangeProp,

	_temp: null,

	setPercentage: function(value) {
		this.parent(value);

		var cValue = this._itemProperties.get(this._propertyToEffect);

		//temp=end
		//(end-start)*value+start
		_temp.equals(this._endValue);
		_temp.sub(this._startValue);
		_temp.mulScalar(value);
		_temp.add(this._startValue);

		//now subtract the new value from the cValue
		_temp.sub(cValue);

		this._itemProperties.changeAdvanced(this.id, this._propertyToEffect, _temp);
	},
	setItemToEffect: function(itemToEffect, itemProperties) {
		this.parent(itemToEffect, itemProperties);

		if (this._startValue == null) this._startValue = this._itemProperties.getStart(this._propertyToEffect).clone();

		if (this._endValue == null) this._endValue = this._itemProperties.getStart(this._propertyToEffect).clone();

		this._startValue.onPropertyChange = this.applyPercentage.bind(this);
		this._endValue.onPropertyChange = this.applyPercentage.bind(this);
	},
	applyPercentage: function() {
		this.setPercentage(this.percentage);
	}
});


var EffectChangePropColour = new Class({
	Extends: EffectChangePropAdvanced,

	initialize: function() {
		var startVal = undefined;
		var endVal = undefined;

		//just end values sent
		if (arguments.length == 3) endVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
		else if (arguments.length == 6) {
			startVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
			endVal = new PropertyColour(arguments[3], arguments[4], arguments[5]);
		} else if (arguments.length == 4) {
			endVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
		} else if (arguments.length == 7) {
			startVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
			endVal = new PropertyColour(arguments[4], arguments[5], arguments[6]);
		}


		if (typeof arguments[0] == 'object') this.parent.apply(this, [arguments[0], startVal, endVal]);
		else this.parent.apply(this, [startVal, endVal]);

		_temp = new PropertyColour();
	}
});
var EffectWidth = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = 'EffectWidth';
		this._propertyToEffect = 'width';
		this.parent.apply(this, arguments);
	}
});

var EffectHeight = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = 'EffectHeight';
		this._propertyToEffect = 'height'
		this.parent.apply(this, arguments);
	}
});

var EffectLeft = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = 'EffectLeft';
		this._propertyToEffect = 'left';
		this.parent.apply(this, arguments);
	}
});

var EffectTop = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = 'EffectTop';
		this._propertyToEffect = 'top';
		this.parent.apply(this, arguments);
	}
});

var EffectOpacity = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = 'EffectOpacity';
		this._propertyToEffect = 'opacity';
		this.parent.apply(this, arguments);
	}
});

var EffectBorderWidth = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = 'EffectBorderWidth';
		this._propertyToEffect = 'border-width';
		this.parent.apply(this, arguments);
	}
});

var EffectBackgroundColor = new Class({
	Extends: EffectChangePropColour,
	initialize: function() {
		this._id = 'EffectBackgroundColor';
		this._propertyToEffect = 'background-color';
		this.parent.apply(this, arguments);
	}
});

var EffectColor = new Class({
	Extends: EffectChangePropColour,
	initialize: function() {
		this._id = 'EffectColor';
		this._propertyToEffect = 'color';
		this.parent.apply(this, arguments);
	}
});


/* COMPOSITE EFFECTS */
var EffectMoveUpAndFade = new Class({
	Extends: Effect,
	initialize: function(itemToEffect, offY) {
		this.parent(itemToEffect);

		this._effFade = new EffectOpacity(0, 1);
		this._effMove = new EffectTop(offY == undefined ? 200 : offY);

		this.add(this._effFade);
		this.add(this._effMove);
	},

	_effFade: null,
	_effMove: null,

	setPercentage: function(value) {
		this._effFade.percentage = value;
		this._effMove.percentage = 1 - value;
	}
});


/* TODO:
	-parse out things like transform, filter
	-write a property manager for colours
	-implement destroying effects
	-handle changing properties like position
		-have a counter for when the property should be reset to start value
	-handle changing the start value
		-effects that did not have a start value sent to them should be updated
	-create a timeline of effects
	-create curves for effects
*/
var ItemProperties = new Class({
	initialize: function(itemToEffect) {
		this._itemToEffect = itemToEffect;
		this._propertiesWatching = {};
		this._propertyValue = {};
		this._propertyStartValue = {};
		this._changeAmountForEffect = {};
	},

	_itemToEffect: null,
	_propertiesWatching: null,
	_propertyValue: null,
	_changeAmountForEffect: null,

	setupEffect: function(effect) {
		var effectID = effect.id;

		if (!this._changeAmountForEffect[effectID]) {
			this._changeAmountForEffect[effectID] = {};

			for (var i = 1; i < arguments.length; i++) {
				var property = arguments[i];

				this._setupProperty(effectID, property);
			}
		}
	},
	get: function(property) {
		return this._propertyValue[property];
	},
	getStart: function(property) {
		return this._propertyStartValue[property];
	},
	change: function(effectID, property, amount) {
		this._propertyValue[property] += amount;
		this._changeAmountForEffect[effectID][property] += amount;
		this._itemToEffect.css(property, this._propertyValue[property]);
	},
	changeAdvanced: function(effectID, property, amount) {
		this._propertyValue[property].add(amount);
		this._changeAmountForEffect[effectID][property].add(amount);

		this._itemToEffect.css(property, this._propertyValue[property].getCSS());
	},
	reset: function(effectID, property) {
		this._propertyValue[property] -= this._changeAmountForEffect[effectID][property];
		this._itemToEffect.css(property, this._propertyValue[property]);
		this._changeAmountForEffect[effectID][property] = 0;
	},
	_setupProperty: function(effectID, property) {
		if (!this._propertiesWatching[property]) {
			var ParserClass = ParserLookUp[property];

			if (ParserClass) {
				this._propertiesWatching[property] = true;

				var parser = new ParserClass(this._itemToEffect.css(property));

				this._propertyStartValue[property] = parser.getValue();
				this._propertyValue[property] = parser.getValue();
				this._changeAmountForEffect[effectID][property] = parser.getValue();
			} else {
				throw new Error('There is no parser defined for ' + property);
			}
		}
	}
});


var PropertyAdvanced = new Class({
	onPropertyChange: null,

	equals: function(otherAdvanced) {
		for (var i in otherAdvanced) {
			if (this[i] && typeof this[i] == 'number') {
				this[i] = otherAdvanced[i];
			}
		}

		return this;
	},
	add: function(otherAdvanced) {
		for (var i in otherAdvanced) {
			if (this[i] && typeof this[i] == 'number') {
				this[i] += otherAdvanced[i];
			}
		}

		return this;
	},
	sub: function(otherAdvanced) {
		for (var i in otherAdvanced) {
			if (this[i] && typeof this[i] == 'number') {
				this[i] -= otherAdvanced[i];
			}
		}

		return this;
	},
	mulScalar: function(amount) {
		for (var i in otherAdvanced) {
			if (this[i] && typeof this[i] == 'number') {
				this[i] *= amount;
			}
		}

		return this;
	},
	getCSS: function() {
		throw new Error('Override this function');
	},
	clone: function() {
		throw new Error('Override this function');
	}
});

var PropertyColour = new Class({
	Extends: PropertyAdvanced,

	initialize: function(r, g, b, a) {
		this.__defineGetter__('r', this.getR);
		this.__defineGetter__('g', this.getG);
		this.__defineGetter__('b', this.getB);
		this.__defineGetter__('a', this.getA);

		this.__defineSetter__('r', this.setR);
		this.__defineSetter__('g', this.setG);
		this.__defineSetter__('b', this.setB);
		this.__defineSetter__('a', this.setA);

		this._r = r == undefined ? 0 : r;
		this._g = g == undefined ? 0 : g;
		this._b = b == undefined ? 0 : b;
		this._a = a == undefined || isNaN(a) ? 1 : a;
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

		this.onPropertyChange();
	},
	setG: function(value) {
		this._g = value;

		this.onPropertyChange();
	},
	setB: function(value) {
		this._b = value;

		this.onPropertyChange();
	},
	setA: function(value) {
		this._a = value;

		this.onPropertyChange();
	},
	equals: function(otherAdvanced) {
		this._r = otherAdvanced.r;
		this._g = otherAdvanced.g;
		this._b = otherAdvanced.b;
		this._a = otherAdvanced.a;

		return this;
	},
	add: function(otherAdvanced) {
		this._r += otherAdvanced.r;
		this._g += otherAdvanced.g;
		this._b += otherAdvanced.b;
		this._a += otherAdvanced.a;

		return this;
	},
	sub: function(otherAdvanced) {
		this._r -= otherAdvanced.r;
		this._g -= otherAdvanced.g;
		this._b -= otherAdvanced.b;
		this._a -= otherAdvanced.a;

		return this;
	},
	mulScalar: function(amount) {
		this._r *= amount;
		this._g *= amount;
		this._b *= amount;
		this._a += amount;

		return this;
	},
	getCSS: function() {
		return 'rgba(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ', '+ this.a +')';
	},
	clone: function() {
		var rVal = new PropertyColour(this.r, this.g, this.b, this.a);

		return rVal;
	}
});
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