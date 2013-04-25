var KeyFrame = new Class({
	initialize: function( track, time, percentage, easing ) {
		this._track = track;
		this._time = time;
		this._percentage = percentage;
		this._easing = easing;
	},

	_nextKeyframe: null,
	_prevKeyframe: null,
	_track: null,
	_time: 0,
	_percentage: 0,
	_easing: null,

	setPrev: function( keyframe ) {
		if( this._prevKeyframe ) {
			this._prevKeyframe._nextKeyframe = keyframe;
		} else if( this == this._track.rootKeyFrame ) {
			this._track.rootKeyFrame = keyframe;
		}

		this._prevKeyframe = keyframe;
	},

	setNext: function( keyframe ) {
		if( this._nextKeyframe ) {
			this._nextKeyframe._prevKeyframe = keyframe;
		} else if( this == this._track.lastKeyFrame ) {
			this._track.lastKeyFrame = keyframe;
		} 

		this._nextKeyframe = keyframe;
	}
});



var Track = new Class({
	initialize: function( effectType, itemToEffect ) {
		this.effect = new effectType( itemToEffect );
	},

	effect: null,
	rootKeyFrame: null,
	lastKeyFrame: null,
	curKeyFrame: null,
	_curIdx: 0,

	add: function( time, percentage, easing ) {
		var nKeyFrame = new KeyFrame( this, time, percentage, easing );

		if( this.rootKeyFrame ) {
			if( this.lastKeyFrame._time < time ) {
				this.lastKeyFrame.setNext( nKeyFrame );
			} else {
				throw new Error( 'Key frames should be in chronological order' );
			}

		} else {
			this.rootKeyFrame = this.lastKeyFrame = this.curKeyFrame = nKeyFrame;
		}

		return this;
	},

	setPercentage: function( percentage ) {
		var startKeyFrame = this.curKeyFrame;
		var nextKeyFrame = this.curKeyFrame._nextKeyframe;

		//check if we need to move forward in the linked list
		while( nextKeyFrame && nextKeyFrame._time < percentage ) {
			startKeyFrame = nextKeyFrame;
			nextKeyFrame = startKeyFrame._nextKeyframe;
		}

		//check if we need to move backward in the linked list
		while( startKeyFrame && startKeyFrame._time > percentage ) {
			nextKeyFrame = startKeyFrame;
			startKeyFrame = startKeyFrame._prevKeyframe;
		}

		this.effect.enabled = nextKeyFrame && startKeyFrame;

		//if we're enabed we want to calculate the effects percentage
		if( this.effect.enabled ) {
			var curTime = ( percentage - startKeyFrame._time ) / ( nextKeyFrame._time - startKeyFrame._time );
			var easing = startKeyFrame._easing;

			if( easing == null ) {
				this.effect.percentage = ( nextKeyFrame._percentage - startKeyFrame._percentage ) * curTime + startKeyFrame._percentage;
			} else {
				this.effect.percentage = easing( curTime, startKeyFrame._percentage, nextKeyFrame._percentage - startKeyFrame._percentage, 1 );
			}
		}
	},

	getEffect: function() {
		return this.effect;
	}
});


var EffectTimeline = new Class({
	Extends: Effect,

	initialize: function( itemToEffect ) {
		this._type = 'EffectTimeline';
		this._tracksById = {};
		this._tracks = [];
		this._effectStart = {};
		this._effectEnd = {};
		this._effectDuration = {};

		this.parent( itemToEffect );
	},

	_tracksById: null,
	_tracks: null,
	_effectStart: null,
	_effectEnd: null,
	_effectDuration: null,

	createTrack: function( effectType, itemToEffect, id ) {
		if( itemToEffect === undefined ) {
			itemToEffect = this.itemToEffect;
		}

		var nTrack = new Track( effectType, itemToEffect );

		if( id === undefined ) {
			this._tracksById[ id ] = nTrack;
		}

		this._tracks.push( nTrack );

		return nTrack;
	},

	getTrack: function( id ) {
		return this._tracksById[ id ];
	},

	setPercentage: function( value ) {
		for( var i = 0, len = this._tracks.length; i < len; i++ ) {
			this._tracks[ i ].setPercentage( value );
		}

		this.parent( value );
	}
});