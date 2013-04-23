var EffectPercentage = new Class({
	Extends: Effect,

	setItemToEffect: function( effect ) {
		this._itemToEffect = effect;
	}
});










//SINE
var SineEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.SineEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var SineEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.SineEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var SineEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.SineEaseInOut( value, 0, 1, 1 ) );
		}
	}
});


//QUINT
var QuintEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuintEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var QuintEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuintEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var QuintEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuintEaseInOut( value, 0, 1, 1 ) );
		}
	}
});


//QUART
var QuartEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuartEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var QuartEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuartEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var QuartEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuartEaseInOut( value, 0, 1, 1 ) );
		}
	}
});


//QUAD
var QuadEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuadEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var QuadEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.QuadEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var QuadEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuadEaseInOut( value, 0, 1, 1 ) );
	}
});


//EXPO
var ExpoEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.ExpoEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var ExpoEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.ExpoEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var ExpoEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.ExpoEaseInOut( value, 0, 1, 1 ) );
		}
	}
});


//ELASTIC
var ElasticEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.ElasticEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var ElasticEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {	
			this._itemToEffect.effectPercentage( easing.ElasticEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var ElasticEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.ElasticEaseInOut( value, 0, 1, 1 ) );
		}
	}
});


//CIRCULAR
var CircularEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.CircularEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var CircularEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.CircularEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var CircularEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.CircularEaseInOut( value, 0, 1, 1 ) );
		}
	}
});

//BACK
var BackEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.BackEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var BackEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.BackEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var BackEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.BackEaseInOut( value, 0, 1, 1 ) );
		}
	}
});


//BOUNCE
var BounceEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.BounceEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var BounceEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.BounceEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var BounceEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.BounceEaseInOut( value, 0, 1, 1 ) );
		}
	}
});


//CUBIC
var ElasticEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.CubicEaseIn( value, 0, 1, 1 ) );
		}
	}
});

var CubicEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.CubicEaseOut( value, 0, 1, 1 ) );
		}
	}
});

var CubicEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		if( this._itemToEffect ) {
			this._itemToEffect.effectPercentage( easing.CubicEaseInOut( value, 0, 1, 1 ) );
		}
	}
});
















