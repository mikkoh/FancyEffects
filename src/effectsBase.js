var EffectIds = {};

EffectIds.keys = {};

EffectIds.getId = function( effectType ) {
	if(EffectIds.keys[effectType] === undefined)
		EffectIds.keys[effectType] = 0;

	var rVal = effectType + EffectIds.keys[effectType];

	EffectIds.keys[effectType]++;

	return rVal;
};





var Effect = new Class({
	initialize: function(itemToEffect) {
		this.__proto__.__defineSetter__('percentage', this.setPercentage);
		this.__proto__.__defineGetter__('percentage', this.getPercentage);
		this.__proto__.__defineGetter__('id', this.getId);

		this._id = EffectIds.getId( this._type );

		this._effectIdx = {};
		this._effects = [];

		this._effectEffectIdx = {};
		this._effectEffects = [];

		if (itemToEffect) this.setItemToEffect(itemToEffect);
	},

	_type: 'Effect',
	_id: null,
	_itemToEffect: null,
	_itemProperties: null,
	_percentage: 0,
	_percentageToApply: 0,
	_effectIdx: null,
	_effectEffectIdx: null,
	_effects: null,
	_effectEffects: null,

	getId: function() {
		return this._id;
	},
	getStart: function(property) {
		return this._itemProperties.getStart(property);
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

		if( this._effectEffects.length>0 ) {
			this._percentageToApply = 0;

			for(var i = 0; i < this._effectEffects.length; i++ ) {
				this._effectEffects[i].setPercentage( this._percentage );
			}

			this._percentageToApply /= this._effectEffects.length;
		} else {
			this._percentageToApply = this._percentage;
		}

		for (var i = 0; i < this._effects.length; i++) {
			this._effects[i].setPercentage( this._percentageToApply );
		}
	},
	effectPercentage: function(percentage) {
		this._percentageToApply += percentage;
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
		//check if this effect being added will effect this effect
		//or if it will effect the itemToEffect
		if ( effect instanceof EffectPercentage ) {
			if( this._effectEffectIdx[effect.id] === undefined ) {
				this._effectEffectIdx[effect.id] = this._effectEffects.length;
				this._effectEffects.push( effect );

				effect.setItemToEffect( this );
				effect.percentage = this.percentage;
			}
		} else {
			//check to see if this effect has already been added
			if( this._effectIdx[effect.id] === undefined ) {
				this._effectIdx[effect.id] = this._effects.length;
				this._effects.push( effect );

				effect.setItemToEffect( this._itemToEffect, this._itemProperties );
				effect.percentage = this.percentage;
			}
		}
	},
	remove: function(effect) {
		if ( this._effectIdx[effect.id] !== undefined ) {
			var idx = this._effectIdx[effect.id];
			var effect = this._effects[idx];

			effect.destroy();

			this._effects.splice(idx, 1);

			//reset the idx lookup to reflect the removed item
			for ( var i = idx; i < this._effects.length; i++ ) {
				this._effectIdx[this._effects[i].id] = i;
			}
		} else if( this._effectEffectIdx[effect.id] !== undefined ) {
			var idx = this._effectIdx[effect.id];
			var effect = this._effectEffects[idx];

			effect.destroy();

			this._effectEffects.splice(idx, 1);

			//reset the idx lookup to reflect the removed item
			for ( var i = idx; i < this._effectEffects.length; i++ ) {
				this._effectEffects[this._effectEffects[i].id] = i;
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
			this._startValueNotDefined = true;
			this._startValue = this._itemProperties.getStart(this._propertyToEffect).clone();
			this._itemProperties.getStart(this._propertyToEffect).onPropertyChange.add(this._onStartValueChange.bind(this));
		}

		if (this._endValue == null) {
			this._endValue = this._itemProperties.getStart(this._propertyToEffect).clone();
		}

		this._startValue.onPropertyChange.add(this.applyPercentage.bind(this));
		this._endValue.onPropertyChange.add(this.applyPercentage.bind(this));
	},
	getStartValue: function() {
		return this._startValue;
	},
	setStartValue: function(value) {
		this._startValue = value;

		this.setPercentage(this._percentageToApply);
	},
	getEndValue: function() {
		return this._endValue;
	},
	setEndValue: function(value) {
		this._endValue = value;

		this.setPercentage(this._percentageToApply);
	},
	setPercentage: function(value) {
		this.parent(value);

		var cValue = this._itemProperties.get(this._propertyToEffect);

		this._itemProperties.change(this.id,
									this._propertyToEffect,
									this._temp.getChange(this._percentageToApply, cValue, this._startValue, this._endValue));
	},
	applyPercentage: function() {
		this.setPercentage(this.percentage);
	},
	_onStartValueChange: function() {
		this._startValue.equals(this._itemProperties.getStart(this._propertyToEffect));
		this.applyPercentage();
	},
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
		this._type = 'EffectChangePropColour';

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