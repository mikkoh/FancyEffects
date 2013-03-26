var EffectPercentage = new Class({
	Extends: Effect,

	setItemToEffect: function( effect ) {
		this._itemToEffect = effect;
	}
});

var ElasticEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ElasticEaseOut( value, 0, 1, 1 ) );
	}
});