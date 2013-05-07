define(['Class', 'lib/FancyEffects/src/KeyFrame'], function(Class, KeyFrame){

	var Track = new Class({
		initialize: function( effect ) {
			this.effect = effect;
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

	return Track;

});