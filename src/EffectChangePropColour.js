define(['Class', 'lib/FancyEffects/src/EffectChangeProp'], function(Class, EffectChangeProp){	

	var EffectChangePropColour = new Class({
		Extends: EffectChangeProp,

		initialize: function() {
			this._type = 'EffectChangePropColour';

			var startVal = undefined;
			var endVal = undefined;

			this._tempChangeAmount = new PropertyColour();
			this._modifiedStart = new PropertyColour();
			this._modifiedEnd = new PropertyColour();

			//just end values sent
			if ( typeof arguments[0] == 'object' ) {
				if ( arguments.length == 4 ) {
					endVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
				} else if ( arguments.length == 7 ) {
					startVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
					endVal = new PropertyColour(arguments[4], arguments[5], arguments[6]);
				} else if ( arguments.length == 5 ) {
					endVal = new PropertyColour(arguments[1], arguments[2], arguments[3], arguments[4]);
				} else if ( arguments.length == 9 ) {
					startVal = new PropertyColour(arguments[1], arguments[2], arguments[3], arguments[4]);
					endVal = new PropertyColour(arguments[5], arguments[6], arguments[7], arguments[8]);
				} else if ( arguments.length > 1 ) {
					throw new Error('You should instantiate this colour with either: \n' +
									'itemToEffect, r, g, b\n' +
									'itemToEffect, r, g, b, a\n' +
									'itemToEffect, r, g, b, r, g, b\n' +
									'itemToEffect, r, g, b, a, r, g, b, a\n');
				}

				this.parent.apply(this, [arguments[0], startVal, endVal]);
			} else {
				if ( arguments.length == 3 ) {
					endVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
				} else if ( arguments.length == 6 ) {
					startVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
					endVal = new PropertyColour(arguments[3], arguments[4], arguments[5]);
				} else if ( arguments.length == 4 ) {
					endVal = new PropertyColour(arguments[0], arguments[1], arguments[2], arguments[3]);
				} else if ( arguments.length == 8 ) {
					startVal = new PropertyColour(arguments[0], arguments[1], arguments[2], arguments[3]);
					endVal = new PropertyColour(arguments[4], arguments[5], arguments[6], arguments[7]);
				} else if ( arguments.length > 0 ){
					throw new Error('You should instantiate this colour with either: \n' +
									'r, g, b\n' +
									'r, g, b, a\n' +
									'r, g, b, r, g, b\n' +
									'r, g, b, a, r, g, b, a\n');
				}

				this.parent.apply(this, [startVal, endVal]);
			}
		}
	});

	return EffectChangePropColour;

});