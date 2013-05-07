define(['Class', 'lib/src/FancyEffects/EffectPercentage'], function(Class, EffectPercentage){

	var Effects = {};

	//SINE
	Effects.SineEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.SineEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.SineEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.SineEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.SineEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.SineEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});


	//QUINT
	Effects.QuintEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuintEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.QuintEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuintEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.QuintEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuintEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});


	//QUART
	Effects.QuartEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuartEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.QuartEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuartEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.QuartEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuartEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});


	//QUAD
	Effects.QuadEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuadEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.QuadEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.QuadEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.QuadEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			this._itemToEffects.effectPercentage( easing.QuadEaseInOut( value, 0, 1, 1 ) );
		}
	});


	//EXPO
	Effects.ExpoEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.ExpoEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.ExpoEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.ExpoEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.ExpoEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.ExpoEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});


	//ELASTIC
	Effects.ElasticEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.ElasticEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.ElasticEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {	
				this._itemToEffects.effectPercentage( easing.ElasticEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.ElasticEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.ElasticEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});


	//CIRCULAR
	Effects.CircularEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.CircularEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.CircularEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.CircularEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.CircularEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.CircularEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});

	//BACK
	Effects.BackEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.BackEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.BackEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.BackEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.BackEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.BackEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});


	//BOUNCE
	Effects.BounceEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.BounceEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.BounceEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.BounceEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.BounceEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.BounceEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});


	//CUBIC
	Effects.ElasticEaseIn = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.CubicEaseIn( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.CubicEaseOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.CubicEaseOut( value, 0, 1, 1 ) );
			}
		}
	});

	Effects.CubicEaseInOut = new Class({
		Extends: EffectPercentage,

		setPercentage: function(value) {
			if( this._itemToEffect ) {
				this._itemToEffects.effectPercentage( easing.CubicEaseInOut( value, 0, 1, 1 ) );
			}
		}
	});

	return Effects;

});















