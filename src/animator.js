var Time = {};

Time.deltaTime = 0;
Time.scale = 1;
Time.onEnterFrame = new Signal();

Time.setTargetFrameRate = function(frameRate) {
	Time._targetMilli = 1000 / frameRate;
};

Time._targetMilli = 1000 / 60;
Time._lastCallTime = 0;
Time._allowOnEnterFrame = false;

Time._onEnterFrameFunction = function() {
	var curCallTime = Date.now();
	
	Time.deltaTime = curCallTime - Time._lastCallTime;

	Time.scale = Time.deltaTime / Time._targetMilli;

	if (isNaN(Time.scale)) Time.scale = 1;

	Time.onEnterFrame.dispatch();

	if (Time._allowOnEnterFrame) requestAnimationFrame(Time._onEnterFrameFunction);
	else Time.scale = 1;

	Time._lastCallTime = curCallTime;
};

Time.onEnterFrame.onListenerAdded.add( function() {
	Time._allowOnEnterFrame = true;
	Time._onEnterFrameFunction();
});

Time.onEnterFrame.onListenerRemoved.add( function() {
	if (Time.onEnterFrame.countListeners == 0) Time._allowOnEnterFrame = false;
});


var Animator = {};
Animator.animations = [];

Animator.createAnimation = function( effect, percentage, duration, onComplete ) {
	Animator.animations.push( new Animation(effect, percentage, duration, onComplete) );

	return Animator.animations[ Animator.animations.length - 1 ];
};

Animator.destroyAnimation = function( animation ) {
	animation.shouldBeDeleted = true;
};

Animator.tick =function() {
	var animations = Animator.animations;
	
	for(var i = animations.length - 1; i >= 0 ; i-- ) {
		if( !animations[i].shouldBeDeleted ) {
			animations[i].tick();
		} else {
			animations.splice(i, 1);
		}
	}
};

Time.onEnterFrame.add( Animator.tick );


var Animation = new Class({
	initialize: function( effect, percentage, duration, onComplete ) {
		this._effect = effect;
		this._startPercentage = effect.percentage;
		this._percentageChange = percentage - this._startPercentage;
		this._duration = duration * 1000;
		this._startTime = this._currentTime = Date.now();
		this._onComplete = onComplete;
	},

	shouldBeDeleted: false,
	_effect: null,
	_startPercentage: 0,
	_percentageChange: 0,
	_startTime: 0,
	_currentTime: 0,
	_duration: 0,
	_onComplete: null,

	tick: function() {
		this._currentTime += Time.deltaTime;

		var curPerc = ( this._currentTime - this._startTime ) / this._duration;

		if( curPerc >= 1 )
		{
			curPerc = 1;
			this.shouldBeDeleted = true;

			if( this._onComplete )
				this._onComplete();
		}

		this._effect.percentage = this._startPercentage + this._percentageChange * curPerc;
	}
});