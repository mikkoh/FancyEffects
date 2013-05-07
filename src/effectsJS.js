define(['Class', 
	'lib/FancyEffects/src/EffectChangePropNumberWhole',
	'lib/FancyEffects/src/EffectChangePropNumber',
	'lib/FancyEffects/src/EffectChangePropColour',
	'lib/FancyEffects/src/EffectChangeProp'
	],
	function(Class, EffectChangePropNumberWhole, EffectChangePropNumber, EffectChangePropColour, EffectChangeProp){

	var EffectsJS = {};

	EffectsJS.EffectWidth = new Class({
		Extends: EffectChangePropNumberWhole,

		initialize: function() {
			this._type =  'EffectWidth';
			this._propertyToEffect = 'width';
			this.parent.apply(this, arguments);
		}
	});


	EffectsJS.EffectHeight = new Class({
		Extends: EffectChangePropNumberWhole,

		initialize: function() {
			this._type =  'EffectHeight';
			this._propertyToEffect = 'height';
			this.parent.apply(this, arguments);
		}
	});


	EffectsJS.EffectLeft = new Class({
		Extends: EffectChangePropNumberWhole,
		initialize: function() {
			this._type =  'EffectLeft';
			this._propertyToEffect = 'left';
			this.parent.apply(this, arguments);
		}
	});

	EffectsJS.EffectTop = new Class({
		Extends: EffectChangePropNumberWhole,
		initialize: function() {
			this._type =  'EffectTop';
			this._propertyToEffect = 'top';
			this.parent.apply(this, arguments);
		}
	});

	EffectsJS.EffectOpacity = new Class({
		Extends: EffectChangePropNumber,
		initialize: function() {
			this._type =  'EffectOpacity';
			this._propertyToEffect = 'opacity';
			this.parent.apply(this, arguments);
		}
	});

	EffectsJS.EffectBorderWidth = new Class({
		Extends: EffectChangePropNumberWhole,
		initialize: function() {
			this._type =  'EffectBorderWidth';
			this._propertyToEffect = 'border-width';
			this.parent.apply(this, arguments);
		}
	});

	EffectsJS.EffectBackgroundColor = new Class({
		Extends: EffectChangePropColour,
		initialize: function() {
			this._type =  'EffectBackgroundColor';
			this._propertyToEffect = 'background-color';
			this.parent.apply(this, arguments);
		}
	});

	EffectsJS.EffectColor = new Class({
		Extends: EffectChangePropColour,
		initialize: function() {
			this._type =  'EffectColor';
			this._propertyToEffect = 'color';
			this.parent.apply(this, arguments);
		}
	});

	EffectsJS.EffectFilter = new Class({
		Extends: EffectChangeProp,

		_temp: null,

		initialize: function() {
			this._type =  'EffectFilter';
			this._propertyToEffect = '-webkit-filter';
			this._tempChangeAmount = new PropertyFilter();
			this._modifiedStart = new PropertyFilter();
			this._modifiedEnd = new PropertyFilter();

			this.parent.apply(this, arguments);
		}
	});

	EffectsJS.EffectBoxShadow = new Class({
		Extends: EffectChangeProp,

		_temp: null,

		initialize: function() {
			this._type =  'EffectBoxShadow';
			this._propertyToEffect = 'box-shadow';
			this._tempChangeAmount = new PropertyBoxShadow();
			this._modifiedStart = new PropertyBoxShadow();
			this._modifiedEnd = new PropertyBoxShadow();


			this.parent.apply(this, arguments);
		}
	});

	return EffectsJS;

});