var AniInOut = new Class({
	Extends: EffectTimeline,

	_allowAdd: false,

	add: function( effect, startPerc, endPerc ) {
		if( this._allowAdd ) {
			this.parent( effect, startPerc, endPerc );
		} else {
			throw new Error('Please use the addIn and addOut function to add effects');
		}
	},

	addIn: function( effect, startPerc, endPerc ) {
		this._allowAdd = true;

		if( startPerc !== undefined && endPerc !== undefined ) {
			this.add( effect, startPerc * 0.5, endPerc * 0.5 );
		} else {
			this.add( effect, 0, 0.5 );
		}

		this._allowAdd = false;

		return effect;
	},

	addOut: function( effect, startPerc, endPerc ) {
		this._allowAdd = true;

		if( startPerc !== undefined && endPerc !== undefined ) {
			this.add( effect, startPerc * 0.5 + 0.5, endPerc * 0.5 + 0.5 );
		} else {
			this.add( effect, 0.5, 1 );
		}

		this._allowAdd = false;

		return effect;
	},

	animateIn: function( duration, onComplete ) {
		this.animate( 0.5, duration, onComplete );
	},

	animateOut: function( duration, onComplete ) {
		this.animate( 1, duration, onComplete );	
	}
});