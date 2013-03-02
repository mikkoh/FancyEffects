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
		if(this.a==1)
			return 'rgb(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ')';
		else
			return 'rgba(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ', '+ this.a +')';
	},
	clone: function() {
		var rVal = new PropertyColour(this.r, this.g, this.b, this.a);

		return rVal;
	}
});