var AniInOutRoll = new Class({
	Extends: EffectTimeline,

	_allowAdd: false,

	add: function( effect, startPerc, endPerc ) {
		if( this._allowAdd ) {
			this.parent( effect, startPerc, endPerc );
		} else {
			throw new Error('Please use the addIn, addRollIn, addRollOut, and addOut function to add effects');
		}
	},

	addIn: function( effect, startPerc, endPerc ) {
		this._allowAdd = true;

		if( startPerc !== undefined && endPerc !== undefined ) {
			this.add( effect, startPerc * 0.25, endPerc * 0.25 );
		} else {
			this.add( effect, 0, 0.25 );
		}

		this._allowAdd = false;

		return effect;
	},

	addOut: function( effect, startPerc, endPerc ) {
		this._allowAdd = true;

		if( startPerc !== undefined && endPerc !== undefined ) {
			this.add( effect, startPerc * 0.25 + 0.75, endPerc * 0.25 + 0.75);
		} else {
			this.add( effect, 0.75, 1 );
		}

		this._allowAdd = false;

		return effect;
	},

	addRollIn: function( effect, startPerc, endPerc ) {
		this._allowAdd = true;

		if( startPerc !== undefined && endPerc !== undefined ) {
			this.add( effect, startPerc * 0.25 + 0.25, endPerc * 0.25 + 0.25 );
		} else {
			this.add( effect, 0.25, 0.5 );
		}

		this._allowAdd = false;

		return effect;
	},

	addRollOut: function( effect, startPerc, endPerc ) {
		this._allowAdd = true;

		if( startPerc !== undefined && endPerc !== undefined ) {
			this.add( effect, startPerc * 0.25 + 0.5, endPerc * 0.25 + 0.5 );
		} else {
			this.add( effect, 0.5, 0.75 );
		}

		this._allowAdd = false;

		return effect;
	},

	animateIn: function( duration, onComplete ) {
		this.animate( 0.25, duration, onComplete );
	},

	rollIn: function( duration, onComplete ) {
		//if we're on the rolled out state we can just safely reset it
		if( this.percentage == 0.75 ) {
			this.percentage = 0.25;
		}

		this.animate( 0.5, duration, onComplete );
	},

	rollOut: function( duration, onComplete ) {
		this._rollOutComplete = onComplete;
		this.animate( 0.75, duration, this._onRollOutComplete.bind( this ) );
	},

	animateOut: function( duration, onComplete ) {
		//if we're on the animateIn state we want to skip the roll stuff
		if( this.percentage == 0.25 ) {
			this.percentage = 0.75;
		}

		this.animate( 1, duration, onComplete );	
	}
});