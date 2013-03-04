var Effect = new Class({
	initialize: function(itemToEffect) {
		this._effectIdx = {};
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
	_effectIdx: null,
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
	reset: function() {
		this._itemProperties.resetAll(this.id);
	},
	destroy: function() {
		this.reset();

		for (var i = 0; i < this._effects.length; i++) {
			this._effects[i].destroy();
		}

		this._effects.length = 0;
	},
	add: function(effect) {
		if (this._effectIdx[effect.id] === undefined) {
			this._effectIdx[effect.id] = this._effects.length;
			this._effects.push(effect);

			effect.setItemToEffect(this._itemToEffect, this._itemProperties);
			effect.percentage = this.percentage;
		}
	},
	remove: function(effect) {
		if (this._effectIdx[effect.id] !== undefined) {
			var idx = this._effectIdx[effect.id];
			var effect = this._effects[idx];

			effect.destroy();

			this._effects.splice(idx, 1);

			for (var i = 0; i < this._effects.length; i++) {
				this._effectIdx[this._effects[i].id] = i;
			}
		}
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

	_temp: null,
	_startValue: null,
	_endValue: null,
	_propertyToEffect: null,

	setItemToEffect: function(itemToEffect, itemProperties) {
		this.parent(itemToEffect, itemProperties);

		this._itemProperties.setupEffect(this, this._propertyToEffect);

		if (this._startValue == null) {
			this._startValue = this._itemProperties.getStart(this._propertyToEffect).clone();
		}

		if (this._endValue == null) {
			this._endValue = this._itemProperties.getStart(this._propertyToEffect).clone();
		}

		this._startValue.onPropertyChange = this.applyPercentage.bind(this);
		this._endValue.onPropertyChange = this.applyPercentage.bind(this);
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
	},
	setPercentage: function(value) {
		this.parent(value);

		var cValue = this._itemProperties.get(this._propertyToEffect);

		this._itemProperties.change(this.id,
		this._propertyToEffect,
		this._temp.getChange(value, cValue, this._startValue, this._endValue));
	},
	applyPercentage: function() {
		this.setPercentage(this.percentage);
	}
});

var EffectChangePropNumber = new Class({
	Extends: EffectChangeProp,

	initialize: function() {
		var startVal = undefined;
		var endVal = undefined;

		if (typeof arguments[0] == 'object') {
			if (arguments.length == 2) {
				endVal = new PropertyNumber(arguments[1]);
			} else if (arguments.length == 3) {
				startVal = new PropertyNumber(arguments[1]);
				endVal = new PropertyNumber(arguments[2]);
			}

			this.parent.apply(this, [arguments[0], startVal, endVal]);
		} else {
			if (arguments.length == 1) {
				endVal = new PropertyNumber(arguments[0]);
			} else if (arguments.length == 2) {
				startVal = new PropertyNumber(arguments[0]);
				endVal = new PropertyNumber(arguments[1]);
			}

			this.parent.apply(this, [startVal, endVal]);
		}

		this._temp = new PropertyNumber();
	}
});


var EffectChangePropColour = new Class({
	Extends: EffectChangeProp,

	initialize: function() {
		var startVal = undefined;
		var endVal = undefined;

		//just end values sent
		if (typeof arguments[0] == 'object') {
			if (arguments.length == 4) {
				endVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
			} else if (arguments.length == 7) {
				startVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
				endVal = new PropertyColour(arguments[4], arguments[5], arguments[6]);
			} else if (arguments.length == 5) {
				endVal = new PropertyColour(arguments[1], arguments[2], arguments[3], arguments[4]);
			} else if (arguments.length == 9) {
				startVal = new PropertyColour(arguments[1], arguments[2], arguments[3], arguments[4]);
				endVal = new PropertyColour(arguments[5], arguments[6], arguments[7], arguments[8]);
			}

			this.parent.apply(this, [arguments[0], startVal, endVal]);
		} else {
			if (arguments.length == 3) {
				endVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
			} else if (arguments.length == 6) {
				startVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
				endVal = new PropertyColour(arguments[3], arguments[4], arguments[5]);
			} else if (arguments.length == 4) {
				endVal = new PropertyColour(arguments[0], arguments[1], arguments[2], arguments[3]);
			} else if (arguments.length == 8) {
				startVal = new PropertyColour(arguments[0], arguments[1], arguments[2], arguments[3]);
				endVal = new PropertyColour(arguments[4], arguments[5], arguments[6], arguments[7]);
			}

			this.parent.apply(this, [startVal, endVal]);
		}
	
		this._temp = new PropertyColour();
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
		this._propertyToEffect = 'height';
		this._temp = new PropertyNumber();
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

var EffectFilter = new Class({
	Extends: EffectChangeProp,

	_temp: null,

	initialize: function() {
		this._id = 'EffectFilter';
		this._propertyToEffect = '-webkit-filter';
		this._temp = new PropertyFilter();

		this.parent.apply(this, arguments);
	}
});

var EffectBoxShadow = new Class({
	Extends: EffectChangeProp,

	_temp: null,

	initialize: function() {
		this._id = 'EffectBoxShadow';
		this._propertyToEffect = 'box-shadow';
		this._temp = new PropertyBoxShadow();

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
		this._propertyValue[property].add(amount);

		this._changeAmountForEffect[effectID][property].add(amount);

		this._itemToEffect.css(property, this._propertyValue[property].getCSS());
	},
	reset: function(effectID, property) {
		this._propertyValue[property].sub(this._changeAmountForEffect[effectID][property]);
		
		this._changeAmountForEffect[effectID][property].reset();

		this._itemToEffect.css(property, this._propertyValue[property].getCSS());
	},
	resetAll: function(effectID) {
		for (var i in this._changeAmountForEffect[effectID]) {
			this.reset(effectID, i);
		}
	},
	_setupProperty: function(effectID, property) {
		var ParserClass = ParserLookUp[property];

		if (!this._propertiesWatching[property]) {
			if (ParserClass) {
				this._propertiesWatching[property] = true;

				var parser = new ParserClass(this._itemToEffect.css(property));

				this._propertyStartValue[property] = parser.getValue();
				this._propertyValue[property] = parser.getValue();
			} else {
				throw new Error('There is no parser defined for ' + property);
			}
		}

		this._changeAmountForEffect[effectID][property] = ParserClass.getZeroProperty();
	}
});


var Property = new Class({
	_onPropertyChange: null,

	initialize: function() {
		this.__defineGetter__('onPropertyChange', this.getPropertyChange);
		this.__defineSetter__('onPropertyChange', this.setPropertyChange);
	},

	getPropertyChange: function() {
		return this._onPropertyChange;
	},
	setPropertyChange: function(value) {
		this._onPropertyChange = value;
	},
	add: function(otherItem) {
		throw new Error('You must override this function');
	},
	sub: function(otherItem) {
		throw new Error('You must override this function');
	},
	equals: function(otherItem) {
		throw new Error('You must override this function');
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		throw new Error('You must override this function');
		return this;
	},
	getCSS: function() {
		throw new Error('You must override this function');
	},
	clone: function() {
		throw new Error('You must override this function');
	}
});

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
		this.onPropertyChange();
	},
	add: function(otherItem) {
		this._value += otherItem.value;
	},
	sub: function(otherItem) {
		this._value -= otherItem.value;
	},
	equals: function(otherItem) {
		this._value = otherItem.value;
	},
	reset: function() {
		this._value = 0;
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
	add: function(otherItem) {
		this._r += otherItem.r;
		this._g += otherItem.g;
		this._b += otherItem.b;
		this._a += otherItem.a;
	},
	sub: function(otherItem) {
		this._r -= otherItem.r;
		this._g -= otherItem.g;
		this._b -= otherItem.b;
		this._a -= otherItem.a;
	},
	equals: function(startVal) {
		this._r = startVal.r;
		this._g = startVal.g;
		this._b = startVal.b;
		this._a = startVal.a;
	},
	reset: function() {
		this._r = 0;
		this._g = 0;
		this._b = 0;
		this._a = 1;
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
	}
});

var PropertyFilter = new Class({
	Extends: Property,

	initialize: function(blur, brightness, contrast, dropShadow, grayScale, hueRotation, invert, opacity, saturate, sepia) {
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
		this._dropShadow = dropShadow == undefined ? new PropertyBoxShadow() : dropShadow;
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

		this.onPropertyChange();
	},
	setBrightness: function(value) {
		this._brightness = value;
		this.onPropertyChange();
	},
	setContrast: function(value) {
		this._contrast = value;
		this.onPropertyChange();
	},
	setDropShadow: function(value) {
		this._dropShadow = value;
		this.onPropertyChange();
	},
	setGrayScale: function(value) {
		this._grayScale = value;

		this.onPropertyChange();
	},
	setHueRotation: function(value) {
		this._hueRotation = value;
		this.onPropertyChange();
	},
	setInvert: function(value) {
		this._invert = value;
		this.onPropertyChange();
	},
	setOpacity: function(value) {
		this._opacity = value;
		this.onPropertyChange();
	},
	setSaturate: function(value) {
		this._saturate = value;
		this.onPropertyChange();
	},
	setSepia: function(value) {
		this._sepia = value;
		this.onPropertyChange();
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
		this._inset = inset == 'inset';

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
		this.onPropertyChange();
	},
	setOffY: function(value) {
		this._offY = value;
		this.onPropertyChange();
	},
	setBlur: function(value) {
		this._blur = value;
		this.onPropertyChange();
	},
	setSpread: function(value) {
		this._spread = value;
		this.onPropertyChange();
	},
	setInset: function(value) {
		this._inset = value;
		this.onPropertyChange();
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
	},
	sub: function(otherItem) {
		this.parent(otherItem);

		this._offX -= otherItem.offX;
		this._offY -= otherItem.offY;
		this._blur -= otherItem.blur;
		this._spread -= otherItem.spread;
	},
	equals: function(otherItem) {
		this.parent(otherItem);

		this._offX = otherItem.offX;
		this._offY = otherItem.offY;
		this._blur = otherItem.blur;
		this._spread = otherItem.spread;
	},
	reset: function() {
		this._offX = 0;
		this._offY = 0;
		this._blur = 0;
		this._spread = 0;
		this._inset = false;
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
var REGEX_VALUE_EXTENSION = /^(\d+\.?\d*)((px)?(%)?)$/;
var REGEX_VALUE_COLOUR_RGB = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\)$/;
var REGEX_VALUE_BOX_SHADOW = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\) (\d+)px (\d+)px (\d+)px( (\d+)px( inset)?)?$/;

var REGEX_VALUE_FILTER_BLUR = /blur\((\d+)px\)/;
var REGEX_VALUE_FILTER_BRIGHTNESS = /brightness\((\d+\.?\d*)\)/;
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

		this._value = new PropertyNumber( parseFloat(valueResult[1]) );
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
			this._value = new PropertyColour(parseFloat(valArr[1]), 
											 parseFloat(valArr[2]), 
											 parseFloat(valArr[3]), 
											 parseFloat(parseFloat(valArr[5]).toPrecision(2)));
		} else {
			throw new Error('Could not parse colour:', this._cssValue);
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

		if (valArr != undefined) {
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
			throw new Error('Could not parse drop shadow:', this._cssValue);
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