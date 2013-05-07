define(['Class', 'lib/FancyEffects/src/EffectChangeProp', 'lib/FancyEffects/src/PropertyNumberWhole'], function(Class, EffectChangeProp, PropertyNumberWhole){

	var EffectChangePropNumberWhole = new Class({
		Extends: EffectChangeProp,

		initialize: function() {
			var startVal = undefined;
			var endVal = undefined;

			this._tempChangeAmount = new PropertyNumberWhole();
			this._modifiedStart = new PropertyNumberWhole();
			this._modifiedEnd = new PropertyNumberWhole();

			if (typeof arguments[0] == 'object') {
				if (arguments.length == 2) {
					endVal = new PropertyNumberWhole(arguments[1]);
				} else if (arguments.length == 3) {
					startVal = new PropertyNumberWhole(arguments[1]);
					endVal = new PropertyNumberWhole(arguments[2]);
				}

				this.parent.apply(this, [arguments[0], startVal, endVal]);
			} else {
				if (arguments.length == 1) {
					endVal = new PropertyNumberWhole(arguments[0]);
				} else if (arguments.length == 2) {
					startVal = new PropertyNumberWhole(arguments[0]);
					endVal = new PropertyNumberWhole(arguments[1]);
				}

				this.parent.apply(this, [startVal, endVal]);
			}
		}
	});

	return EffectChangePropNumberWhole;

});