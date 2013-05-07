define(['Class', 'lib/FancyEffects/src/Effect'], function(Class, Effect){
	
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

		_tempChangeAmount: null,
		_modifiedStart: null,
		_modifiedEnd: null,
		_startValue: null,
		_endValue: null,
		_propertyToEffect: null,

		setEnabled: function( value ) {
			if( this._itemProperties && this.enabled != value ) {
				if( value ) {
					this._itemProperties.enable( this.id, this._propertyToEffect );
				} else {
					this._itemProperties.disable( this.id, this._propertyToEffect );
				}
			}

			this.parent( value );
		},
		setItemToEffect: function(itemToEffect, itemProperties) {
			this.parent(itemToEffect, itemProperties);

			this._itemProperties.setupEffect(this, this._propertyToEffect);

			var itemToEffectStartVal = this._itemProperties.getStart( this._propertyToEffect );

			if (this._startValue == null) {
				this._startValueNotDefined = true;
				this._startValue = itemToEffectStartVal.clone();
				itemToEffectStartVal.onPropertyChange.add( this._onStartValueChange.bind(this) );
			}

			if (this._endValue == null) {
				this._endValue = itemToEffectStartVal.clone();
			}

			this._modifiedStart.equals( this._startValue ).sub( itemToEffectStartVal );
			this._modifiedEnd.equals( this._endValue ).sub( itemToEffectStartVal );
		
			this._startValue.onPropertyChange.add( this._onPropertyChange.bind(this) );
			this._endValue.onPropertyChange.add( this._onPropertyChange.bind(this) );
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
			if( this.enabled ) {
				this.parent( value );
				//if an effect was initialized without a item to effect this can be null
				if( this._itemProperties != null ) {
					var cValue = this._itemProperties.getEffectChange( this.id, this._propertyToEffect );

					//var cValue = this._itemProperties.get(this._propertyToEffect);
					this._itemProperties.change(this.id,
												this._propertyToEffect,
												this._tempChangeAmount.getChange( this._percentageToApply, cValue, this._modifiedStart, this._modifiedEnd ));
				}
			}
		},
		_onPropertyChange: function() {
			var itemToEffectStartVal = this._itemProperties.getStart( this._propertyToEffect );

			this._modifiedStart.equals( this._startValue ).sub( itemToEffectStartVal );
			this._modifiedEnd.equals( this._endValue ).sub( itemToEffectStartVal );

			this.setPercentage( this.percentage );
		},

		_onStartValueChange: function() {
			var itemToEffectStartVal = this._itemProperties.getStart( this._propertyToEffect );

			this._startValue.equals( itemToEffectStartVal );

			this._onPropertyChange();
		},
	});

	return EffectChangeProp;

});