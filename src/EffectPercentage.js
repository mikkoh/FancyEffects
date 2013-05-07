define(['Class', 'lib/FancyEffects/src/Effect'], function(Class, Effect){

	var EffectPercentage = new Class({
		Extends: Effect,

		type: "EffectPercentage",

		setItemToEffect: function( effect ) {
			this._itemToEffect = effect;
		}
	});

	return EffectPercentage;

});