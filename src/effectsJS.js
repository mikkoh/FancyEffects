var EffectWidth = new Class({
	Extends: EffectChangePropNumber,

	initialize: function() {
		this._id = EffectIds.getId( 'EffectWidth' );
		this._propertyToEffect = 'width';
		this.parent.apply(this, arguments);
	}
});


var EffectHeight = new Class({
	Extends: EffectChangePropNumber,

	initialize: function() {
		this._id = EffectIds.getId( 'EffectHeight' );
		this._propertyToEffect = 'height';
		this._temp = new PropertyNumber();
		this.parent.apply(this, arguments);
	}
});


var EffectLeft = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = EffectIds.getId( 'EffectLeft' );
		this._propertyToEffect = 'left';
		this.parent.apply(this, arguments);
	}
});

var EffectTop = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = EffectIds.getId( 'EffectTop' );
		this._propertyToEffect = 'top';
		this.parent.apply(this, arguments);
	}
});

var EffectOpacity = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = EffectIds.getId( 'EffectOpacity' );
		this._propertyToEffect = 'opacity';
		this.parent.apply(this, arguments);
	}
});

var EffectBorderWidth = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._id = EffectIds.getId( 'EffectBorderWidth' );
		this._propertyToEffect = 'border-width';
		this.parent.apply(this, arguments);
	}
});

var EffectBackgroundColor = new Class({
	Extends: EffectChangePropColour,
	initialize: function() {
		this._id = EffectIds.getId( 'EffectBackgroundColor' );
		this._propertyToEffect = 'background-color';
		this.parent.apply(this, arguments);
	}
});

var EffectColor = new Class({
	Extends: EffectChangePropColour,
	initialize: function() {
		this._id = EffectIds.getId( 'EffectColor' );
		this._propertyToEffect = 'color';
		this.parent.apply(this, arguments);
	}
});

var EffectFilter = new Class({
	Extends: EffectChangeProp,

	_temp: null,

	initialize: function() {
		this._id = EffectIds.getId( 'EffectFilter' );
		this._propertyToEffect = '-webkit-filter';
		this._temp = new PropertyFilter();

		this.parent.apply(this, arguments);
	}
});

var EffectBoxShadow = new Class({
	Extends: EffectChangeProp,

	_temp: null,

	initialize: function() {
		this._id = EffectIds.getId( 'EffectBoxShadow' );
		this._propertyToEffect = 'box-shadow';
		this._temp = new PropertyBoxShadow();

		this.parent.apply(this, arguments);
	}
});


/* COMPOSITE EFFECTS */
var EffectMoveUpAndFade = new Class({
	Extends: Effect,
	initialize: function(itemToEffect, offY) {
		this.parent(itemToEffect);

		this._effFade = new EffectOpacity(0, 1);
		this._effMove = new EffectTop(offY == undefined ? 200 : offY);

		this.add(this._effFade);
		this.add(this._effMove);
	},

	_effFade: null,
	_effMove: null,

	setPercentage: function(value) {
		this._effFade.percentage = value;
		this._effMove.percentage = 1 - value;
	}
});