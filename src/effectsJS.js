var EffectWidth = new Class({
	Extends: EffectChangePropNumberWhole,

	initialize: function() {
		this._type =  'EffectWidth';
		this._propertyToEffect = 'width';
		this.parent.apply(this, arguments);
	}
});


var EffectHeight = new Class({
	Extends: EffectChangePropNumberWhole,

	initialize: function() {
		this._type =  'EffectHeight';
		this._propertyToEffect = 'height';
		this.parent.apply(this, arguments);
	}
});


var EffectLeft = new Class({
	Extends: EffectChangePropNumberWhole,
	initialize: function() {
		this._type =  'EffectLeft';
		this._propertyToEffect = 'left';
		this.parent.apply(this, arguments);
	}
});

var EffectTop = new Class({
	Extends: EffectChangePropNumberWhole,
	initialize: function() {
		this._type =  'EffectTop';
		this._propertyToEffect = 'top';
		this.parent.apply(this, arguments);
	}
});

var EffectOpacity = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._type =  'EffectOpacity';
		this._propertyToEffect = 'opacity';
		this.parent.apply(this, arguments);
	}
});

var EffectBorderWidth = new Class({
	Extends: EffectChangePropNumberWhole,
	initialize: function() {
		this._type =  'EffectBorderWidth';
		this._propertyToEffect = 'border-width';
		this.parent.apply(this, arguments);
	}
});

var EffectBackgroundColor = new Class({
	Extends: EffectChangePropColour,
	initialize: function() {
		this._type =  'EffectBackgroundColor';
		this._propertyToEffect = 'background-color';
		this.parent.apply(this, arguments);
	}
});

var EffectColor = new Class({
	Extends: EffectChangePropColour,
	initialize: function() {
		this._type =  'EffectColor';
		this._propertyToEffect = 'color';
		this.parent.apply(this, arguments);
	}
});

var EffectFilter = new Class({
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

var EffectBoxShadow = new Class({
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