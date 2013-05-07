define(['Class'], function(Class){

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

	return KeyFrame;

});