define([], function(){

	var EffectIds = {};

	EffectIds.keys = {};

	EffectIds.getId = function( effectType ) {
		if(EffectIds.keys[effectType] === undefined)
			EffectIds.keys[effectType] = 0;

		var rVal = effectType + EffectIds.keys[effectType];

		EffectIds.keys[effectType]++;

		return rVal;
	};

	return EffectIds;

});