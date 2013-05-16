define(['Class', 'lib/FancyEffects/src/EffectIds', 'lib/FancyEffects/src/ItemPropertiesBank', 'lib/FancyEffects/src/animator'], function(Class, EffectIds, ItemPropertiesBank, Animator) {

    /*
    *    Module list
    *
    *    Animator            lib/FancyEffects/src/animator.js
    *
    */

	var Effect = new Class({
		initialize: function( itemToEffect ) {
			this.__defineSetter__( 'percentage', this.setPercentage );
			this.__defineGetter__( 'percentage', this.getPercentage );
			this.__defineGetter__( 'enabled', this.getEnabled );
			this.__defineSetter__( 'enabled', this.setEnabled );
			this.__defineGetter__( 'id', this.getId );
			this.__defineGetter__( 'effects', this.getEffects );


			this._id = EffectIds.getId( this._type );

			this._effectIdx = {};
			this._effects = [];

			this._effectEffectIdx = {};
			this._effectEffects = [];

			if (itemToEffect) {
				this.setItemToEffect( itemToEffect );
			}

			this.setPercentage( 0 );
		},

		_enabled: true,
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
		_animation: null,

		getId: function() {
			return this._id;
		},
		getPercentage: function() {
			return this._percentage;
		},
		setPercentage: function( value ) {
			if( this.enabled ) {
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
			}
		},
		getEnabled: function() { 
			return this._enabled;
		},
		setEnabled: function( value ) {
			this._enabled = value;

			for( var i = 0; i < this._effects.length; i++ ) {
				this._effects[ i ].enabled = value;
			}
		},
		getStart: function( property ) {
			return this._itemProperties.getStart( property );
		},
		getEffects: function() {
			return this._effects;
		},
		setItemToEffect: function(itemToEffect, itemProperties) {
			if( !this._itemToEffect )
			{
				this._itemToEffect = itemToEffect;

				if( !(this._itemToEffect.type === "EffectPercentage") ) {
					if ( itemProperties ) {
						this._itemProperties = itemProperties;
					}
					else {
						this._itemProperties = ItemPropertiesBank.get( this._itemToEffect );
					}
				}
			}

			//now set item to effect for all child effects
			for (var i = 0; i < this._effects.length; i++) {
				this._effects[i].setItemToEffect( itemToEffect, itemProperties );
			};
		},
		animate: function( targetPercentage, duration, onComplete ) {
			if( this._animation )
				Animator.destroyAnimation( this._animation );

			this._animation = Animator.createAnimation( this, targetPercentage, duration, onComplete );
		},
		stopAnimate: function() {
			Animator.destroyAnimation( this._animation );
			this._animation = null;
		},
		effectPercentage: function( percentage ) {
			this._percentageToApply += percentage;
		},
		reset: function() {
			if( this._itemProperties ) {
				this._itemProperties.resetAll( this.id );
			}
		},
		destroy: function() {
			this.reset();

			for (var i = 0; i < this._effects.length; i++) {
				this._effects[i].destroy();
			}

			if( this._itemToEffect ) {
				ItemPropertiesBank.destroy( this._itemToEffect );
			}
			
			this._effects.length = 0;

			if( this._animation ) {
				this.stopAnimate();
			}
		},
		add: function(effect) {
			//check if this effect being added will effect this effect
			//or if it will effect the itemToEffect
			if ( effect.type === "EffectPercentage" ) {
				if( this._effectEffectIdx[effect.id] === undefined ) {
					this._effectEffectIdx[effect.id] = this._effectEffects.length;
					this._effectEffects.push( effect );

					effect.setItemToEffect( this );
					effect.percentage = this.percentage;
				}
			} else {
				//check to see if this effect has already been added
				if( this._effectIdx[ effect.id ] === undefined ) {
					this._effectIdx[ effect.id ] = this._effects.length;
					this._effects.push( effect );

					effect.setItemToEffect( this._itemToEffect, this._itemProperties );
					effect.percentage = this.percentage;
				}
			}

			return effect;
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

			return effect;
		}
	});

	return Effect;

});