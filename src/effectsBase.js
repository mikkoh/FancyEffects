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

		if (this._startValue == null) {
			this._startValue = this._itemProperties.getStart(this._propertyToEffect).clone();
		}

		if (this._endValue == null) {
			this._endValue = this._itemProperties.getStart(this._propertyToEffect).clone();
		}

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

		_temp = new PropertyColour();
	}
});