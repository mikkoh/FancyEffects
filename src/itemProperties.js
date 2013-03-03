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
		this._a *= amount;

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
	Extends: PropertyAdvanced,

	initialize: function(blur, brightness, contrast, dropShadow, grayScale, hueRotation, invert, opacity, saturate, sepia) {
		this._blur=blur;
		this._brightness=brightness;
		this._contrast=contrast;
		this._dropShadow=dropShadow;
		this._grayScale=grayScale;
		this._hueRotation=hueRotation;
		this._invert=invert;
		this._opacity=opacity;
		this._saturate=saturate;
		this._sepia=sepia;

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
	},

	_blur: 0,
	_brightness: 0,
	_contrast: 0,
	_dropShadow: null,
	_grayScale: 0,
	_hueRotation: 0,
	_invert: 0,
	_opacity: 1,
	_saturate: 0,
	_sepia: 0,

	getBlur: function() function() { return this._blur; },
	getBrightness: function() { return this._brightness; },
	getContrast: function() { return this._contrast; },
	getDropShadow: function() { return this._dropShadow; },
	getGrayScale: function() { return this._grayScale; },
	getHueRotation: function() { return this._hueRotation; },
	getInvert: function() { return this._invert; },
	getOpacity: function() { return this._opacity; },
	getSaturate: function() { return this._saturate; },
	getSepia: function() { return this._sepia; },
	setBlur: function(value) {
		this._g = value;

		this.onPropertyChange();
	},
	setBrightness: function(value) {
		this._blur = value;
		this.onPropertyChange();
	},
	setContrast: function(value) {
		this._brightness = value;
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
	getCSS: function() {
		return 'blur(' + this._blur + 'px); '+ 
			   'brightness(' + this._brightness + '); ' +
			   'contrast(' + this._contrast + '); ' +
			   //'dropShadow'
			   'grayscale(' + this._grayScale + '); ' +
			   'hue-rotate(' + this._hueRotation + 'deg); ' +
			   'invert(' + this._invert + '); ' +
			   'opacity(' + this._opacity + '); ' +
			   'saturate(' + this._saturate + '); ' +
			   'sepia(' + this._sepia + ');'
	}
});