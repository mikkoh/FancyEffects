define(['Class', 'lib/FancyEffects/src/EffectChangeProp'], function(Class, EffectChangeProp){

	var EffectChangePropNumber = new Class({
		Extends: EffectChangeProp,

		initialize: function() {
			var startVal = undefined;
			var endVal = undefined;

			this._tempChangeAmount = new PropertyNumber();
			this._modifiedStart = new PropertyNumber();
			this._modifiedEnd = new PropertyNumber();

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
		}
	});

	return EffectChangePropNumber;

});