var MoveUpAndFade = new Class({
	Extends: Effect,
	initialize: function(itemToEffect, offY) {
		this._type = 'EffectMoveUpAndFade';
		this.parent(itemToEffect);

		this._effFade = new EffectOpacity( 0, 1 );
		this._effMove = new EffectTop( offY == undefined ? 200 : offY );

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