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

	add: function(otherItem) {
		for (var i in this) {
			if (typeof this[i] == 'number') {
				this[i] += otherItem[i];
			}
		}
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		for (var i in this) {
			if (typeof this[i] == 'number') {
				this[i] = (endValue[i] - startValue[i]) * percentage + startValue[i];
				this[i] -= curValue[i];
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
	Extends: PropertyAdvanced,

	initialize: function(blur, brightness, contrast, dropShadow, grayScale, hueRotation, invert, opacity, saturate, sepia) {
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

	getBlur: function() { return this._blur; },
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
		this._saturate+= otherItem.saturate;
		this._sepia += otherItem.sepia;
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
		this._saturate-= curValue.saturate;
		this._sepia -= curValue.sepia;

		return this;
	},
	getCSS: function() {
		return 'blur(' + this._blur + 'px) '+ 
			   'brightness(' + this._brightness + ') ' +
			   'contrast(' + this._contrast + ') ' +
			   //'dropShadow'
			   'grayscale(' + this._grayScale + ') ' +
			   'hue-rotate(' + this._hueRotation + 'deg) ' +
			   'invert(' + this._invert + ') ' +
			   'opacity(' + this._opacity + ') ' +
			   'saturate(' + this._saturate + ') ' +
			   'sepia(' + this._sepia + ')'
	},
	clone: function() {
		return new PropertyFilter( this._blur,
								   this._brightness,
								   this._contrast,
								   this._dropShadow,
								   this._grayScale,
								   this._hueRotation,
								   this._invert,
								   this._opacity,
								   this._saturate,
								   this._sepia );
	}
});

var PropertyBoxShadow=new Class({
	Extends: PropertyColour,

	initialize: function(r, g, b, a, offX, offY, blur, spread, inset) {
		this.__defineGetter__( 'offX', this.getOffX );
		this.__defineGetter__( 'offY', this.getOffY );
		this.__defineGetter__( 'blur', this.getBlur );
		this.__defineGetter__( 'spread', this.getSpread );
		this.__defineGetter__( 'inset', this.getInset );
		this.__defineSetter__( 'offX', this.setOffX );
		this.__defineSetter__( 'offY', this.setOffY );
		this.__defineSetter__( 'blur', this.setBlur );
		this.__defineSetter__( 'spread', this.setSpread );
		this.__defineSetter__( 'inset', this.setInset );

		this._offX = offX == undefined ? 0 : parseFloat(offX);
		this._offY = offY == undefined ? 0 : parseFloat(offY);
		this._blur = blur == undefined ? 0 : parseFloat(blur);
		this._spread = spread == undefined ? 0 : parseFloat(spread);
		this._inset = inset == 'inset';

		this.parent(r, g, b, a);

		console.log(this.getCSS());
	},

	_offX: 0,
	_offY: 0,
	_blur: 0,
	_spread: 0,
	_inset: false,

	getOffX: function() { return this._offX },
	getOffY: function() { return this._offY },
	getBlur: function() { return this._blur },
	getSpread: function() { return this._spread },
	getInset: function() { return this._inset },
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
	add: function(otherItem) {
		this.parent(otherItem);
		
		this._offX += otherItem.offX;
		this._offY += otherItem.offY;
		this._blur += otherItem.blur;
		this._spread += otherItem.spread;
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this.parent(percentage, curValue, startValue, endValue);

		this._offX = ( endValue.offX - startValue.offX ) * percentage + startValue.offX;
		this._offY = ( endValue.offY - startValue.offY ) * percentage + startValue.offY;
		this._blur = ( endValue.blur - startValue.blur ) * percentage + startValue.blur;
		this._spread = ( endValue.spread - startValue.spread ) * percentage + startValue.spread;

		this._offX -= curValue.offX;
		this._offY -= curValue.offY;
		this._blur -= curValue.blur;
		this._spread -= curValue.spread;
	
		return this;
	},
	getCSS: function() { 
		var rVal = this.parent() + ' ';

		rVal += Math.round(this.offX) + 'px ' + Math.round(this.offY) + 'px ';

		if( this.blur > 0 )
			rVal += Math.round(this.blur) + 'px ';

		if( this.spread > 0 )
			rVal += Math.round(this.spread) + 'px ';

		if( this.inset )
			rVal += 'inset';

		return rVal;
	},
	clone: function() {
		return new PropertyBoxShadow( this._r, 
									  this._g, 
									  this._b, 
									  this._a, 
									  this._offY, 
									  this._offY, 
									  this._blur, 
									  this._spread, 
									  this._inset );
	}
});