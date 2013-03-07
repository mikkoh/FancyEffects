var EffectTimeline = new Class({
	Extends: Effect,

	initialize: function() {
		this._type = 'EffectTimeline';
		this._effectStart = {};
		this._effectEnd = {};
		this._effectDuration = {};

		this.parent();
	},

	_effectStart: null,
	_effectEnd: null,
	_effectDuration: null,

	add: function( effect, startPerc, endPerc ) {
		//check if this effect being added will effect this effect
		//or if it will effect the itemToEffect
		if ( effect instanceof EffectPercentage ) {
			//we'll just use the parent functionality cause it should be the exact same
			this.parent( effect );
		} else {
			//check to see if this effect has already been added
			if( this._effectIdx[effect.id] === undefined ) {
				this._effectStart[ effect.id ] = startPerc == undefined ? 0 : startPerc;
				this._effectEnd[ effect.id ] = endPerc == undefined ? 1 : endPerc;
				this._effectDuration[ effect.id ] = endPerc - startPerc;

				this._effectIdx[effect.id] = this._effects.length;
				this._effects.push( effect );

				if( this._itemToEffect )
					effect.setItemToEffect( this._itemToEffect, this._itemProperties );

				//we don't want it to effect this timeline unless
				//it should effect it otherwise we just add it straight up
				if( this._isEffectEffecting(effect) ) {
					effect.percentage = this.percentage;	
				}
			}
		}
	},
	remove: function( effect ) {
		//check if this is an effect effect or just a regular old effect
		//if this first if statement has an index then this is a regular effect
		if ( this._effectIdx[effect.id] !== undefined ) {
			//we'll just use the parent functionality cause it should be the exact same
			//for effect effects
			this.parent( effect );

			//delete it from the start and end time lookups
			delete this._effectStart[ effect.id ];
			delete this._effectEnd[ effect.id ];

		} else if( this._effectEffectIdx[effect.id] !== undefined ) {
			//we'll just use the parent functionality cause it should be the exact same
			//for effect effects
			this.parent( effect );
		}
	},
	setPercentage: function( value ) {
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
			//check whether this effect should effect
			//is it in a position in the timeline where it should be doing stuff
			if( this._isEffectEffecting(this._effects[i]) ) {
				var startTime = this._effectStart[ this._effects[i].id ];
				var duration = this._effectDuration[ this._effects[i].id ];
				var curTime = ( this._percentageToApply - startTime ) / duration;

				this._effects[i].setPercentage( curTime );
			} else if(this._percentageToApply < this._effectStart[ this._effects[i].id ]) {
				this._effects[i].setPercentage( 0 );
			} else {
				this._effects[i].setPercentage( 1 );
			}
		}
	},
	_isEffectEffecting: function( effect ) {
		return this._percentageToApply >= this._effectStart[ effect.id ] && 
			   this._percentageToApply <= this._effectEnd[ effect.id ];
	}
});