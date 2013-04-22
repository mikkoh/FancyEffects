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
var MoveItemToItem = new Class({
	Extends: EffectTimeline,

	initialize: function() {
		this._type = 'MoveItemToItem';

		this.parent();

		this._numItems = arguments.length;

		var lastItemIdx = this._numItems - 1;
		var positions = [];

		//since we're going to be using these positions over and over again I will
		//cache them for further use so we don't have to use jQuery position over
		//and over again
		for( var i = 0; i < this._numItems; i++ ) {
			positions[ i ] = arguments[ i ].position();
		}

		var startItemPos = positions[ 0 ];

		for( var i = 1; i < this._numItems; i++ ) {
			var startPerc = (i - 1) / lastItemIdx;
			var endPerc = i / lastItemIdx;
			
			var prevItemPos = positions[ i -1 ];
			var curItemPos = positions[ i ];
			var prevEndOffX = startItemPos.left - prevItemPos.left;
			var prevEndOffY = startItemPos.top - prevItemPos.top;
			var endOffX = startItemPos.left - curItemPos.left;
			var endOffY = startItemPos.top - curItemPos.top;

			for( var j = 0; j < this._numItems; j++ ) {
				var itemToEffect = arguments[ j ];
				var itemToEffectPos = positions[ j ];
				var startOffX = itemToEffectPos.left;
				var startOffY = itemToEffectPos.top;
				
				this.add( new EffectLeft( itemToEffect, itemToEffectPos.left + prevEndOffX, itemToEffectPos.left + endOffX ), startPerc, endPerc );
				this.add( new EffectTop( itemToEffect, itemToEffectPos.top + prevEndOffY, itemToEffectPos.top + endOffY ), startPerc, endPerc );
			}			
		}
	},

	_numItems: 0,

	animateToItem: function( idx, duration ) {
		var targetPerc = idx / (this._numItems - 1);

		this.animate( targetPerc, Math.abs( targetPerc - this.percentage ) * duration );
	}
})
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
		this.parent( value );

		this._effFade.percentage = this._percentageToApply;
		this._effMove.percentage = 1 - this._percentageToApply;
	}
});
var ScaleItemToItem = new Class({
	Extends: EffectTimeline,

	_initPosEffects: null,

	initialize: function() {
		this._type = 'MoveItemToItem';

		this.parent();

		this._numItems = arguments.length;
		this._initPosEffects = [];

		var startItem = arguments[ 0 ];
		var itemProperties = ItemPropertiesBank.get( arguments[ 0 ] );
		var startItemLeft = itemProperties.getStart( 'left' ) == undefined ? startItem.position().left : itemProperties.getStart( 'left' );
		var startItemTop = itemProperties.getStart( 'top' ) == undefined ? startItem.position().left : itemProperties.getStart( 'top' );
		var startItemHeight = itemProperties.getStart( 'height' ) == undefined ? startItem.height() : itemProperties.getStart( 'height' );
		var lastItemIdx = this._numItems - 1;

		//check if the first item doesn't have absolute positioning if so throw a warning
		if( startItem.css( 'position' ) != 'absolute' ) {
			this._throwAbsoluteWarning( 0 );
		}

		for( var i = 1; i < this._numItems; i++ ) {
			//now setup all the timeline effects
			var startPerc = ( i - 1 ) / lastItemIdx;
			var endPerc = i / lastItemIdx;
			var bottom = startItemTop + startItemHeight;

			//zero the left position of this item to the startItem
			this._initPosEffects.push( new EffectLeft( arguments[ i ], startItemLeft, startItemLeft) );

			//make the previous item go from the top to bottom and make it go to zero height
			this.add( new EffectTop( arguments[ i - 1 ], startItemTop, bottom ), startPerc, endPerc );
			this.add( new EffectHeight( arguments[ i - 1 ], startItemHeight, 0 ), startPerc, endPerc );

			//also make this item stay on the bottom after theyve animated down
			//if we do it for the last item then there will be overlap of two effects and we really dont want that
			if( i != lastItemIdx) {
				this.add( new EffectTop( arguments[ i - 1 ], bottom, bottom ), endPerc, 1 );
				this.add( new EffectHeight( arguments[ i - 1 ], 0, 0 ), endPerc, 1 );
			}

			//now make the current item go to the top of the startItem and then just make it scale from 0px height to
			//the startItems height
			this.add( new EffectTop( arguments[ i ], startItemTop, startItemTop ), startPerc, endPerc );
			this.add( new EffectHeight( arguments[ i ], 0, startItemHeight ), startPerc, endPerc );

			//before this point we want the item to be at the top and at height 0
			this.add( new EffectTop( arguments[ i ], startItemTop, startItemTop ), 0, startPerc );
			this.add( new EffectHeight( arguments[ i ], 0, 0 ), 0, startPerc );

			if( arguments[ i ].css('position') != 'absolute' ) {
				this._throwAbsoluteWarning( i );
			}
		}

		//initialize all effects to 0 percentage
		this.setPercentage( 0 );
	},

	_numItems: 0,
	_initPosEffects: null,

	destroy: function() {
		for( var i = 0, len = this._initPosEffects.length; i < len; i++ ) {
			this._initPosEffects[ i ].destroy();
		}

		this.parent();
	},

	_throwAbsoluteWarning: function( idx ) {
		console.warn( 'The item at index ' + idx + ' does not have absolute positioning. This effect may not look right if we\'re using relative positioning or something else' );
	}
});
/***************************************************************
****************************************************************
****************************************************************
******** NOTE THE FOLLOWING ARE PENNER EASING EQUATIONS ********
******** ROBERT PENNER IS THE MAN ******************************
****************************************************************
******** Copyright © 2001 Robert Penner ************************
******** All rights reserved. **********************************
****************************************************************
***************************************************************/

var easing = {};


//SINE
easing.SineEaseIn = function( t, b, c, d ) {
	return -c * Math.cos(t/d * PI_D2) + c + b;
};

easing.SineEaseOut = function( t, b, c, d ) {
	return c * Math.sin(t/d * PI_D2) + b;
};

easing.SineEaseInOut = function( t, b, c, d ) {
	return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
};


//QUINT
easing.QuintEaseIn = function( t, b, c, d ) {
	return c*(t/=d)*t*t*t*t + b;
};

easing.QuintEaseOut = function( t, b, c, d ) {
	return c*((t=t/d-1)*t*t*t*t + 1) + b;
};

easing.QuintEaseInOut = function( t, b, c, d ) {
	if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
	return c/2*((t-=2)*t*t*t*t + 2) + b;
};


//QUART
easing.QuartEaseIn = function( t, b, c, d ) {
	return c*(t/=d)*t*t*t + b;
};

easing.QuartEaseOut = function( t, b, c, d ) {
	return -c * ((t=t/d-1)*t*t*t - 1) + b;
};

easing.QuartEaseInOut = function( t, b, c, d ) {
	if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
	return -c/2 * ((t-=2)*t*t*t - 2) + b;
};


//QUAD
easing.QuadEaseIn = function( t, b, c, d ) {
	return c*(t/=d)*t + b;
};

easing.QuadEaseOut = function( t, b, c, d ) {
	return -c *(t/=d)*(t-2) + b;
};

easing.QuadEaseInOut = function( t, b, c, d ) {
	if ((t/=d/2) < 1) return c/2*t*t + b;
	return -c/2 * ((--t)*(t-2) - 1) + b;
};


//EXPO
easing.ExpoEaseIn = function( t, b, c, d ) {
	return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
};

easing.ExpoEaseOut = function( t, b, c, d ) {
	return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
};

easing.ExpoEaseInOut = function( t, b, c, d ) {
	if (t==0) return b;
	if (t==d) return b+c;
	if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
	return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
};


//ELASTIC
easing.ElasticEaseIn = function( t, b, c, d, a, p ) {
	var s;
	if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	if (!a || a < Math.abs(c)) { a=c; s=p/4; }
	else s = p/PI_M2 * Math.asin (c/a);
	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*PI_M2/p )) + b;
};

easing.ElasticEaseOut = function( t, b, c, d, a, p ) {
	if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
};

easing.ElasticEaseInOut = function( t, b, c, d, a, p ) {
	var s;
	if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
	if (!a || a < Math.abs(c)) { a=c; s=p/4; }
	else s = p/PI_M2 * Math.asin (c/a);
	if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*PI_M2/p )) + b;
	return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*PI_M2/p )*.5 + c + b;
};


//CIRCULAR
easing.CircularEaseIn = function( t, b, c, d ) {
	return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
};

easing.CircularEaseOut = function( t, b, c, d ) {
	return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
};

easing.CircularEaseInOut = function( t, b, c, d ) {
	if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
	return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
};


//BACK
easing.BackEaseIn = function( t, b, c, d, s ) {
	if( s == undefined ) s = 1.70158;
	return c*(t/=d)*t*((s+1)*t - s) + b;
};

easing.BackEaseOut = function( t, b, c, d, s ) {
	if( s == undefined ) s = 1.70158;
	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
};

easing.BackEaseInOut = function( t, b, c, d, s ) {
	if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
};


//BOUNCE
easing.BounceEaseIn = function( t, b, c, d ) {
	return c - easeOutBounce (d-t, 0, c, d) + b;
};

easing.BounceEaseOut = function( t, b, c, d ) {
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
};

easing.BounceEaseInOut = function( t, b, c, d ) {
	if (t < d/2) return easeInBounce (t*2, 0, c, d) * .5 + b;
	else return easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
};


//CUBIC
easing.CubicEaseIn = function( t, b, c, d ) {
	return c*(t/=d)*t*t + b;
};

easing.CubicEaseOut = function( t, b, c, d ) {
	return c*((t=t/d-1)*t*t + 1) + b;
};

easing.CubicEaseInOut = function( t, b, c, d ) {
	if ((t/=d/2) < 1) return c/2*t*t*t + b;
	return c/2*((t-=2)*t*t + 2) + b;
};




var EffectPercentage = new Class({
	Extends: Effect,

	setItemToEffect: function( effect ) {
		this._itemToEffect = effect;
	}
});










//SINE
var SineEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.SineEaseIn( value, 0, 1, 1 ) );
	}
});

var SineEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.SineEaseOut( value, 0, 1, 1 ) );
	}
});

var SineEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.SineEaseInOut( value, 0, 1, 1 ) );
	}
});


//QUINT
var QuintEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuintEaseIn( value, 0, 1, 1 ) );
	}
});

var QuintEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuintEaseOut( value, 0, 1, 1 ) );
	}
});

var QuintEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuintEaseInOut( value, 0, 1, 1 ) );
	}
});


//QUART
var QuartEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuartEaseIn( value, 0, 1, 1 ) );
	}
});

var QuartEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuartEaseOut( value, 0, 1, 1 ) );
	}
});

var QuartEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuartEaseInOut( value, 0, 1, 1 ) );
	}
});


//QUAD
var QuadEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuadEaseIn( value, 0, 1, 1 ) );
	}
});

var QuadEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuadEaseOut( value, 0, 1, 1 ) );
	}
});

var QuadEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.QuadEaseInOut( value, 0, 1, 1 ) );
	}
});


//EXPO
var ExpoEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ExpoEaseIn( value, 0, 1, 1 ) );
	}
});

var ExpoEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ExpoEaseOut( value, 0, 1, 1 ) );
	}
});

var ExpoEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ExpoEaseInOut( value, 0, 1, 1 ) );
	}
});


//ELASTIC
var ElasticEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ElasticEaseIn( value, 0, 1, 1 ) );
	}
});

var ElasticEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ElasticEaseOut( value, 0, 1, 1 ) );
	}
});

var ElasticEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ElasticEaseInOut( value, 0, 1, 1 ) );
	}
});


//CIRCULAR
var CircularEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.CircularEaseIn( value, 0, 1, 1 ) );
	}
});

var CircularEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.CircularEaseOut( value, 0, 1, 1 ) );
	}
});

var CircularEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.CircularEaseInOut( value, 0, 1, 1 ) );
	}
});

//BACK
var BackEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.BackEaseIn( value, 0, 1, 1 ) );
	}
});

var BackEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.BackEaseOut( value, 0, 1, 1 ) );
	}
});

var BackEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.BackEaseInOut( value, 0, 1, 1 ) );
	}
});


//BOUNCE
var BounceEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.BounceEaseIn( value, 0, 1, 1 ) );
	}
});

var BounceEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.BounceEaseOut( value, 0, 1, 1 ) );
	}
});

var BounceEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.BounceEaseInOut( value, 0, 1, 1 ) );
	}
});


//CUBIC
var ElasticEaseIn = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.CubicEaseIn( value, 0, 1, 1 ) );
	}
});

var CubicEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.CubicEaseOut( value, 0, 1, 1 ) );
	}
});

var CubicEaseInOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.CubicEaseInOut( value, 0, 1, 1 ) );
	}
});

















var EffectTimeline = new Class({
	Extends: Effect,

	initialize: function( itemToEffect ) {
		this._type = 'EffectTimeline';
		this._effectStart = {};
		this._effectEnd = {};
		this._effectDuration = {};

		this.parent( itemToEffect );
	},

	_effectStart: null,
	_effectEnd: null,
	_effectDuration: null,

	add: function( effect, startPerc, endPerc ) {
		//check if this effect being added will effect this effect
		//or if it will effect the itemToEffect
		if ( effect instanceof EffectPercentage ) {
			//we'll just use the parent functionality cause it should be the exact same
			this.parent( effect );
		} else {
			//check to see if this effect has already been added
			if( this._effectIdx[effect.id] === undefined ) {
				this._effectStart[ effect.id ] = startPerc == undefined ? 0 : startPerc;
				this._effectEnd[ effect.id ] = endPerc == undefined ? 1 : endPerc;
				this._effectDuration[ effect.id ] = endPerc - startPerc;

				this._effectIdx[effect.id] = this._effects.length;
				this._effects.push( effect );

				if( this._itemToEffect )
					effect.setItemToEffect( this._itemToEffect, this._itemProperties );

			
				
				//we don't want it to effect this timeline unless
				//it should effect it otherwise we just add it straight up
				if( this._percentageToApply < this._effectStart[ effect.id ] ) {
					//effect.setPercentage( 0 );
					effect.enabled = false;
				} else if( this._percentageToApply >= this._effectEnd[ effect.id ] && this._effectEnd[ effect.id ] != 1 ) {
					//effect.setPercentage( 1 );
					effect.enabled = false;
				} else {
					var startTime = this._effectStart[ effect.id ];
					var duration = this._effectDuration[ effect.id ];
					var curTime = ( this._percentageToApply - startTime ) / duration;

					effect.enabled = true;
					effect.setPercentage( curTime );
				}
			}
		}
	},
	remove: function( effect ) {
		//check if this is an effect effect or just a regular old effect
		//if this first if statement has an index then this is a regular effect
		if ( this._effectIdx[effect.id] !== undefined ) {
			//we'll just use the parent functionality cause it should be the exact same
			//for effect effects
			this.parent( effect );

			//delete it from the start and end time lookups
			delete this._effectStart[ effect.id ];
			delete this._effectEnd[ effect.id ];

		} else if( this._effectEffectIdx[effect.id] !== undefined ) {
			//we'll just use the parent functionality cause it should be the exact same
			//for effect effects
			this.parent( effect );
		}
	},
	setPercentage: function( value ) {
		if( this.enabled ) {
			this._percentage = value;

			if( this._effectEffects.length>0 ) {
				this._percentageToApply = 0;

				for(var i = 0; i < this._effectEffects.length; i++ ) {
					this._effectEffects[i].setPercentage( this._percentage );
				}

				this._percentageToApply /= this._effectEffects.length;
			} else {
				this._percentageToApply = this._percentage;
			}

			for (var i = 0; i < this._effects.length; i++) {
				//check whether this effect should effect
				//is it in a position in the timeline where it should be doing stuff
				if( this._percentageToApply < this._effectStart[ this._effects[i].id ] ) {
					this._effects[i].setPercentage( 0 );
					this._effects[i].enabled = false;
				} else if( this._percentageToApply >= this._effectEnd[ this._effects[i].id ] && this._effectEnd[ this._effects[i].id ] != 1 ) {
					this._effects[i].setPercentage( 1 );
					this._effects[i].enabled = false;
				} else {
					var startTime = this._effectStart[ this._effects[i].id ];
					var duration = this._effectDuration[ this._effects[i].id ];
					var curTime = ( this._percentageToApply - startTime ) / duration;

					this._effects[i].enabled = true;
					this._effects[i].setPercentage( curTime );
				}
			}
		}
	},
	_isEffectEffecting: function( effect ) {
		return this._percentageToApply >= this._effectStart[ effect.id ] && 
			   this._percentageToApply <= this._effectEnd[ effect.id ];
	}
});
var EffectIds = {};

EffectIds.keys = {};

EffectIds.getId = function( effectType ) {
	if(EffectIds.keys[effectType] === undefined)
		EffectIds.keys[effectType] = 0;

	var rVal = effectType + EffectIds.keys[effectType];

	EffectIds.keys[effectType]++;

	return rVal;
};



var Effect = new Class({
	initialize: function( itemToEffect ) {
		this.__defineSetter__( 'percentage', this.setPercentage );
		this.__defineGetter__( 'percentage', this.getPercentage );
		this.__defineGetter__( 'enabled', this.getEnabled );
		this.__defineSetter__( 'enabled', this.setEnabled );
		this.__defineGetter__( 'id', this.getId );
		this.__defineGetter__( 'effects', this.getEffects );


		this._id = EffectIds.getId( this._type );

		this._effectIdx = {};
		this._effects = [];

		this._effectEffectIdx = {};
		this._effectEffects = [];

		if (itemToEffect) {
			this.setItemToEffect( itemToEffect );
		}

		this.setPercentage( 0 );
	},

	_enabled: true,
	_type: 'Effect',
	_id: null,
	_itemToEffect: null,
	_itemProperties: null,
	_percentage: 0,
	_percentageToApply: 0,
	_effectIdx: null,
	_effectEffectIdx: null,
	_effects: null,
	_effectEffects: null,
	_animation: null,

	getId: function() {
		return this._id;
	},
	getPercentage: function() {
		return this._percentage;
	},
	setPercentage: function( value ) {
		if( this.enabled ) {
			this._percentage = value;

			if( this._effectEffects.length>0 ) {
				this._percentageToApply = 0;

				for(var i = 0; i < this._effectEffects.length; i++ ) {
					this._effectEffects[i].setPercentage( this._percentage );
				}

				this._percentageToApply /= this._effectEffects.length;
			} else {
				this._percentageToApply = this._percentage;
			}

			for (var i = 0; i < this._effects.length; i++) {
				this._effects[i].setPercentage( this._percentageToApply );
			}
		}
	},
	getEnabled: function() { 
		return this._enabled;
	},
	setEnabled: function( value ) {
		this._enabled = value;

		for( var i = 0; i < this._effects.length; i++ ) {
			this._effects[ i ].enabled = value;
		}
	},
	getStart: function(property) {
		return this._itemProperties.getStart(property);
	},
	getEffects: function() {
		return this._effects;
	},
	setItemToEffect: function(itemToEffect, itemProperties) {
		if( !this._itemToEffect )
		{
			this._itemToEffect = itemToEffect;

			if( !(this._itemToEffect instanceof EffectPercentage) ) {
				if ( itemProperties ) {
					this._itemProperties = itemProperties;
				}
				else {
					this._itemProperties = ItemPropertiesBank.get( this._itemToEffect );
				}
			}
		}

		//now set item to effect for all child effects
		for (var i = 0; i < this._effects.length; i++) {
			this._effects[i].setItemToEffect( itemToEffect, itemProperties );
		};
	},
	animate: function( targetPercentage, duration, onComplete ) {
		if( this._animation )
			Animator.destroyAnimation( this._animation );

		this._animation = Animator.createAnimation( this, targetPercentage, duration, onComplete );
	},
	stopAnimate: function() {
		Animator.destroyAnimation( this._animation );
		this._animation = null;
	},
	effectPercentage: function( percentage ) {
		this._percentageToApply += percentage;
	},
	reset: function() {
		if( this._itemProperties ) {
			this._itemProperties.resetAll( this.id );
		}
	},
	destroy: function() {
		this.reset();

		for (var i = 0; i < this._effects.length; i++) {
			this._effects[i].destroy();
		}

		if( this._itemToEffect ) {
			ItemPropertiesBank.destroy( this._itemToEffect );
		}
		
		this._effects.length = 0;

		if( this._animation ) {
			this.stopAnimate();
		}
	},
	add: function(effect) {
		//check if this effect being added will effect this effect
		//or if it will effect the itemToEffect
		if ( effect instanceof EffectPercentage ) {
			if( this._effectEffectIdx[effect.id] === undefined ) {
				this._effectEffectIdx[effect.id] = this._effectEffects.length;
				this._effectEffects.push( effect );

				effect.setItemToEffect( this );
				effect.percentage = this.percentage;
			}
		} else {
			//check to see if this effect has already been added
			if( this._effectIdx[ effect.id ] === undefined ) {
				this._effectIdx[ effect.id ] = this._effects.length;
				this._effects.push( effect );

				effect.setItemToEffect( this._itemToEffect, this._itemProperties );
				effect.percentage = this.percentage;
			}
		}
	},
	remove: function(effect) {
		if ( this._effectIdx[effect.id] !== undefined ) {
			var idx = this._effectIdx[effect.id];
			var effect = this._effects[idx];

			effect.destroy();

			this._effects.splice(idx, 1);

			//reset the idx lookup to reflect the removed item
			for ( var i = idx; i < this._effects.length; i++ ) {
				this._effectIdx[this._effects[i].id] = i;
			}
		} else if( this._effectEffectIdx[effect.id] !== undefined ) {
			var idx = this._effectIdx[effect.id];
			var effect = this._effectEffects[idx];

			effect.destroy();

			this._effectEffects.splice(idx, 1);

			//reset the idx lookup to reflect the removed item
			for ( var i = idx; i < this._effectEffects.length; i++ ) {
				this._effectEffects[this._effectEffects[i].id] = i;
			}
		}
	}
});

var EffectChangeProp = new Class({
	Extends: Effect,
	initialize: function() {
		/*
		ONE ARGUMENT:
						itemToEffect
		TWO ARGUMENTS: 
						itemToEffect, propertyToEffect
						propertyToEffect, endValue

		THREE ARUGMENTS: 
					 	itemToEffect, propertyToEffect, endValue
					 	propertyToEffect, startValue, endValue
						

		FOUR ARGUMENTS: 
						itemToEffect, propertyToEffect, startValue, endValue
		*/

		if (arguments[0] instanceof jQuery) {
			if (arguments.length == 3) {
				this._startValue = arguments[1];
				this._endValue = arguments[2];
			} else if (arguments.length == 2) {
				this._endValue = arguments[1];
			}

			this.parent(arguments[0]);
		} else {
			if (arguments.length == 2) {
				this._startValue = arguments[0];
				this._endValue = arguments[1];
			} else if (arguments.length == 1) {
				this._endValue = arguments[0];
			}

			this.parent();
		}


		this.__defineGetter__('start', this.getStartValue);
		this.__defineSetter__('start', this.setStartValue);
		this.__defineGetter__('end', this.getEndValue);
		this.__defineSetter__('end', this.setEndValue);
	},

	_tempChangeAmount: null,
	_modifiedStart: null,
	_modifiedEnd: null,
	_startValue: null,
	_endValue: null,
	_propertyToEffect: null,

	setEnabled: function( value ) {
		if( this._itemProperties && this.enabled != value ) {
			if( value ) {
				this._itemProperties.enable( this.id, this._propertyToEffect );
			} else {
				this._itemProperties.disable( this.id, this._propertyToEffect );
			}
		}

		this.parent( value );
	},
	setItemToEffect: function(itemToEffect, itemProperties) {
		this.parent(itemToEffect, itemProperties);

		this._itemProperties.setupEffect(this, this._propertyToEffect);

		if (this._startValue == null) {
			this._startValueNotDefined = true;
			this._startValue = this._itemProperties.getStart( this._propertyToEffect ).clone();
			this._itemProperties.getStart( this._propertyToEffect ).onPropertyChange.add( this._onStartValueChange.bind(this) );
		}

		if (this._endValue == null) {
			this._endValue = this._itemProperties.getStart(this._propertyToEffect).clone();
		}


		var itemToEffectStartVal = this._itemProperties.getStart( this._propertyToEffect );
		this._modifiedStart.equals( this._startValue ).sub( itemToEffectStartVal );
		this._modifiedEnd.equals( this._endValue ).sub( itemToEffectStartVal );
	
		this._startValue.onPropertyChange.add(this._onPropertyChange.bind(this));
		this._endValue.onPropertyChange.add(this._onPropertyChange.bind(this));
	},
	getStartValue: function() {
		return this._startValue;
	},
	setStartValue: function(value) {
		this._startValue = value;

		this.setPercentage(this._percentageToApply);
	},
	getEndValue: function() {
		return this._endValue;
	},
	setEndValue: function(value) {
		this._endValue = value;

		this.setPercentage(this._percentageToApply);
	},
	setPercentage: function(value) {
		if( this.enabled ) {
			this.parent( value );
			//if an effect was initialized without a item to effect this can be null
			if( this._itemProperties != null ) {
				var cValue = this._itemProperties.getEffectChange( this.id, this._propertyToEffect );

				//var cValue = this._itemProperties.get(this._propertyToEffect);
				this._itemProperties.change(this.id,
											this._propertyToEffect,
											this._tempChangeAmount.getChange( this._percentageToApply, cValue, this._modifiedStart, this._modifiedEnd ));
			}
		}
	},
	_onPropertyChange: function() {
		var itemToEffectStartVal = this._itemProperties.getStart( this._propertyToEffect );
		this._modifiedStart.equals( this._startValue ).sub( itemToEffectStartVal );
		this._modifiedEnd.equals( this._endValue ).sub( itemToEffectStartVal );

		this.setPercentage( this.percentage );
	},
	_onStartValueChange: function() {
		this._startValue.equals(this._itemProperties.getStart(this._propertyToEffect));
		this._onPropertyChange();
	},
});

var EffectChangePropNumber = new Class({
	Extends: EffectChangeProp,

	initialize: function() {
		var startVal = undefined;
		var endVal = undefined;

		this._tempChangeAmount = new PropertyNumber();
		this._modifiedStart = new PropertyNumber();
		this._modifiedEnd = new PropertyNumber();

		if (typeof arguments[0] == 'object') {
			if (arguments.length == 2) {
				endVal = new PropertyNumber(arguments[1]);
			} else if (arguments.length == 3) {
				startVal = new PropertyNumber(arguments[1]);
				endVal = new PropertyNumber(arguments[2]);
			}

			this.parent.apply(this, [arguments[0], startVal, endVal]);
		} else {
			if (arguments.length == 1) {
				endVal = new PropertyNumber(arguments[0]);
			} else if (arguments.length == 2) {
				startVal = new PropertyNumber(arguments[0]);
				endVal = new PropertyNumber(arguments[1]);
			}

			this.parent.apply(this, [startVal, endVal]);
		}
	}
});


var EffectChangePropNumberWhole = new Class({
	Extends: EffectChangeProp,

	initialize: function() {
		var startVal = undefined;
		var endVal = undefined;

		this._tempChangeAmount = new PropertyNumberWhole();
		this._modifiedStart = new PropertyNumberWhole();
		this._modifiedEnd = new PropertyNumberWhole();

		if (typeof arguments[0] == 'object') {
			if (arguments.length == 2) {
				endVal = new PropertyNumberWhole(arguments[1]);
			} else if (arguments.length == 3) {
				startVal = new PropertyNumberWhole(arguments[1]);
				endVal = new PropertyNumberWhole(arguments[2]);
			}

			this.parent.apply(this, [arguments[0], startVal, endVal]);
		} else {
			if (arguments.length == 1) {
				endVal = new PropertyNumberWhole(arguments[0]);
			} else if (arguments.length == 2) {
				startVal = new PropertyNumberWhole(arguments[0]);
				endVal = new PropertyNumberWhole(arguments[1]);
			}

			this.parent.apply(this, [startVal, endVal]);
		}
	}
});


var EffectChangePropColour = new Class({
	Extends: EffectChangeProp,

	initialize: function() {
		this._type = 'EffectChangePropColour';

		var startVal = undefined;
		var endVal = undefined;

		this._tempChangeAmount = new PropertyColour();
		this._modifiedStart = new PropertyColour();
		this._modifiedEnd = new PropertyColour();

		//just end values sent
		if ( typeof arguments[0] == 'object' ) {
			if ( arguments.length == 4 ) {
				endVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
			} else if ( arguments.length == 7 ) {
				startVal = new PropertyColour(arguments[1], arguments[2], arguments[3]);
				endVal = new PropertyColour(arguments[4], arguments[5], arguments[6]);
			} else if ( arguments.length == 5 ) {
				endVal = new PropertyColour(arguments[1], arguments[2], arguments[3], arguments[4]);
			} else if ( arguments.length == 9 ) {
				startVal = new PropertyColour(arguments[1], arguments[2], arguments[3], arguments[4]);
				endVal = new PropertyColour(arguments[5], arguments[6], arguments[7], arguments[8]);
			} else if ( arguments.length > 1 ) {
				throw new Error('You should instantiate this colour with either: \n' +
								'itemToEffect, r, g, b\n' +
								'itemToEffect, r, g, b, a\n' +
								'itemToEffect, r, g, b, r, g, b\n' +
								'itemToEffect, r, g, b, a, r, g, b, a\n');
			}

			this.parent.apply(this, [arguments[0], startVal, endVal]);
		} else {
			if ( arguments.length == 3 ) {
				endVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
			} else if ( arguments.length == 6 ) {
				startVal = new PropertyColour(arguments[0], arguments[1], arguments[2]);
				endVal = new PropertyColour(arguments[3], arguments[4], arguments[5]);
			} else if ( arguments.length == 4 ) {
				endVal = new PropertyColour(arguments[0], arguments[1], arguments[2], arguments[3]);
			} else if ( arguments.length == 8 ) {
				startVal = new PropertyColour(arguments[0], arguments[1], arguments[2], arguments[3]);
				endVal = new PropertyColour(arguments[4], arguments[5], arguments[6], arguments[7]);
			} else if ( arguments.length > 0 ){
				throw new Error('You should instantiate this colour with either: \n' +
								'r, g, b\n' +
								'r, g, b, a\n' +
								'r, g, b, r, g, b\n' +
								'r, g, b, a, r, g, b, a\n');
			}

			this.parent.apply(this, [startVal, endVal]);
		}
	}
});
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
var ItemPropertiesBank = {};
ItemPropertiesBank.curKey = 0;
ItemPropertiesBank.items = {};
ItemPropertiesBank.itemCount = {};

ItemPropertiesBank.get = function( jQueryItem ) {
	var rVal = null;

	if( jQueryItem[0].$itemPropertiesIndex === undefined ) {
		jQueryItem[0].$itemPropertiesIndex = ItemPropertiesBank.curKey;
		ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ] = 1;

		rVal = new ItemProperties( jQueryItem );
		ItemPropertiesBank.items[ ItemPropertiesBank.curKey ] = rVal;

		ItemPropertiesBank.curKey++;
	} else {
		rVal = ItemPropertiesBank.items[ jQueryItem[0].$itemPropertiesIndex ];
		ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ]++;
	}

	return rVal;
}

ItemPropertiesBank.destroy = function( jQueryItem ) {
	if( jQueryItem[0].$itemPropertiesIndex !== undefined ) {
		ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ]--;

		if( ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ] == 0) {
			delete ItemPropertiesBank[ jQueryItem[0].$itemPropertiesIndex ];
			delete ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ];
			delete jQueryItem[0].$itemPropertiesIndex;	
		}
	}
}


var ItemProperties = new Class({
	initialize: function(itemToEffect) {
		this._itemToEffect = itemToEffect;
		this._propertiesWatching = {};
		this._propertyValue = {};
		this._propertyStartValue = {};
		this._changeAmountForEffect = {};
		this._enabled = {};
	},

	_itemToEffect: null,
	_propertiesWatching: null,
	_propertyValue: null,
	_changeAmountForEffect: null,
	_enabled: null,

	setupEffect: function( effect ) {
		var effectID = effect.id;

		if (!this._changeAmountForEffect[ effectID ]) {
			this._changeAmountForEffect[ effectID ] = {};
			this._enabled[ effectID ] = {};

			for (var i = 1; i < arguments.length; i++) {
				var property = arguments[i];

				this._setupProperty( effectID, property );
			}
		}
	},
	get: function( property ) {
		return this._propertyValue[property];
	},
	getStart: function( property ) {
		return this._propertyStartValue[property];
	},
	getEffectChange: function( effectID, property ) {
		return this._changeAmountForEffect[ effectID ][ property ];
	},
	change: function( effectID, property, amount ) {
		this._propertyValue[ property ].add( amount );

		this._changeAmountForEffect[ effectID ][ property ].add( amount );

		this._itemToEffect.css( property, this._propertyValue[ property ].getCSS() );
	},
	enable: function( effectID, property ) {
		if( !this._enabled[ effectID ][ property ] ) {
			this._enabled[ effectID ][ property ] = true;
			this._propertyValue[property].add( this._changeAmountForEffect[ effectID ][ property ] );

			this._itemToEffect.css(property, this._propertyValue[property].getCSS());
		}
	},
	disable: function( effectID, property ) {
		if( this._enabled[ effectID ][ property ] ) {
			this._enabled[ effectID ][ property ] = false;

			this._propertyValue[property].sub( this._changeAmountForEffect[ effectID ][ property ] );

			this._itemToEffect.css(property, this._propertyValue[property].getCSS());
		}
	},
	reset: function( effectID, property ) {
		if( this._enabled[ effectID ][ property ] ) {
			this._propertyValue[property].sub( this._changeAmountForEffect[effectID][property] );
			
			this._changeAmountForEffect[effectID][property].reset();

			this._itemToEffect.css(property, this._propertyValue[property].getCSS());
		}
	},
	resetAll: function( effectID ) {
		for (var i in this._changeAmountForEffect[effectID]) {
			this.reset(effectID, i);
		}
	},
	_setupProperty: function( effectID, property ) {
		var ParserClass = ParserLookUp[property];

		if (!this._propertiesWatching[property]) {
			if (ParserClass) {
				this._propertiesWatching[property] = true;

				var parser = new ParserClass( this._itemToEffect.css( property ) );

				this._propertyStartValue[ property ] = parser.getValue();
				this._propertyValue[ property ] = parser.getValue();
			} else {
				throw new Error('There is no parser defined for ' + property);
			}
		}

		this._enabled[ effectID ][ property ] = true;
		this._changeAmountForEffect[ effectID ][ property ] = this._propertyStartValue[ property ].getZero();
	}
});



var PropertyClassBuilder = new Class({
	initialize: function( className ) {
		this._className = className;
		this._properties = [];
		this._value = [];
		this._defaultValues = [];
	},

	_className: null,
	_properties: null,
	_value: null,
	_defaultValues: null, 
	_cssDefinition: null,

	addProperty: function( name, value, defaultValue ) {
		this._properties.push( name );
		this._value.push( value );
		this._defaultValues.push( defaultValue );
	},

	setCSSDefinition: function( definition ) {
		this._cssDefinition = definition;
	},

	build: function() {
		var src = this._getConstructorStr() +
				  this._getSetterGetterStr() +
				  this._getAddStr() +
				  this._getSubStr() +
				  this._getMulScalarStr() +
				  this._getEqualsStr() +
				  this._getResetStr() +
				  this._getGetZeroStr() +
				  this._getGetChangeStr() + 
				  this._getCloneStr();


		src = src.substring( 0, src.length-2 );

		ob = eval( '({' + src + '})' );

		ob.getCSS = this._cssDefinition;

		return ob;
	},

	_getConstructorStr: function() {
		var rVal = 'initialize: function() {\n'

		rVal += 'this.onPropertyChange = new Signal();\n'

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += 'this._' + curProp + ' = arguments[ ' + i + ' ] === undefined ? ' + this._defaultValues[ i ] + ' : arguments[ ' + i + ' ];\n';
			rVal += 'this.__defineGetter__("' + curProp + '", this.get' + curProp + ');\n';
			rVal += 'this.__defineSetter__("' + curProp + '", this.set' + curProp + ');\n\n';
		}

		rVal += '},\n'

		return rVal;
	},

	_getSetterGetterStr: function() {
		var rVal = '';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\tget' + curProp + ': function() { return this._' + curProp + ' ; },\n';

			rVal += '\tset' + curProp + ': function( value ) { \n'+
				'\t\tthis._' + curProp + ' = value;' +
				'\t\tthis.onPropertyChange.dispatch();' +
			'},\n';
		}

		return rVal;
	},

	_getAddStr: function() {
		var rVal = '\tadd: function(otherItem) {\n';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\t\tthis._' + curProp + ' += otherItem.' + curProp + ';\n';
		}
		
		rVal += '\t\treturn this;\n \t},\n';

		return rVal;
	},

	_getSubStr: function() {
		var rVal = '\tsub: function(otherItem) {\n';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\t\tthis._' + curProp + ' -= otherItem.' + curProp + ';\n';
		}
		
		rVal += '\t\treturn this;\n \t},\n';

		return rVal;
	},

	_getMulScalarStr: function() {
		var rVal = '\tmulScalar: function(scalar) {\n';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\t\tthis._' + curProp + ' *= scalar;\n';
		}
		
		rVal += '\t\treturn this;\n \t},\n';

		return rVal;
	},

	_getEqualsStr: function() {
		var rVal = '\tequals: function(otherItem) {\n';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\t\tthis._' + curProp + ' = otherItem.' + curProp + ';\n';
		}
		
		rVal += '\t\treturn this;\n \t},\n';

		return rVal;
	},

	_getResetStr: function() {
		var rVal = '\treset: function(otherItem) {\n';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\t\tthis._' + curProp + ' = ' + this._defaultValues[ i ] + ';\n';
		}
		
		rVal += '\t\treturn this;\n \t},\n';

		return rVal;
	},

	_getGetZeroStr: function() {
		var rVal = '\getZero: function() {\n';

		rVal += '\t\treturn new ' + this._className + '('

		for(var i = 0, len = this._properties.length - 1; i < len; i++ ) {
			rVal += '0, ';	
		}

		rVal += '0);\n},\n';

		return rVal;
	},

	_getGetChangeStr: function() {
		var rVal = '\tgetChange: function( percentage, curValue, startValue, endValue ) {\n';

		for(var i = 0, len = this._properties.length; i < len; i++ ) {
			var curProp = this._properties[ i ];

			rVal += '\t\tthis._' + curProp + ' = (endValue.' + curProp + ' - startValue.' + curProp + ') * percentage + startValue.' + curProp + ';\n';
			rVal += '\t\tthis._' + curProp + ' -= curValue.' + curProp + ';\n';
		}

		rVal += '\t\treturn this;\n\t},\n';

		return rVal;
	},

	_getCloneStr: function() {
		var rVal = '\tclone: function() {\n';

		rVal += '\t\treturn new ' + this._className + '('

		for(var i = 0, len = this._properties.length - 1; i < len; i++ ) {
			rVal += 'this._' + this._properties[ i ] + ', ';	
		}

		rVal += 'this._' + this._properties[ i ] + ');\n},\n';

		return rVal;
	}
});






var builder = new PropertyClassBuilder( 'PropertyNumber' );
builder.addProperty( 'value', 0, 0 );
builder.setCSSDefinition( function() {
	return this.value;
});


var PropertyNumber = new Class( builder.build() );





var builder = new PropertyClassBuilder( 'PropertyNumberWhole' );
builder.addProperty( 'value', 0, 0 );
builder.setCSSDefinition( function() {
	return Math.round( this.value );
});


var PropertyNumberWhole = new Class( builder.build() );











var builder = new PropertyClassBuilder( 'PropertyColour' );
builder.addProperty( 'r', 0, 0 );
builder.addProperty( 'g', 0, 0 );
builder.addProperty( 'b', 0, 0 );
builder.addProperty( 'a', 1, 1 );
builder.setCSSDefinition( function() { 
	if( this.a < 1 ) {
		return 'rgba(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ', ' + this.a + ')';
	} else {
		return 'rgb(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ')';
	}
} );


var PropertyColour = new Class( builder.build() );








var builder = new PropertyClassBuilder( 'PropertyFilter' );
builder.addProperty( 'blur', 0, 0 );
builder.addProperty( 'brightness', 0, 0 );
builder.addProperty( 'contrast', 1, 1 );
builder.addProperty( 'dropR', 0, 0 );
builder.addProperty( 'dropG', 0, 0 );
builder.addProperty( 'dropB', 0, 0 );
builder.addProperty( 'dropA', 1, 1 );
builder.addProperty( 'dropOffX', 0, 0 );
builder.addProperty( 'dropOffY', 0, 0 );
builder.addProperty( 'dropBlur', 0, 0 );
builder.addProperty( 'dropSpread', 0, 0 );
builder.addProperty( 'dropInset', 0, 0 );
builder.addProperty( 'grayScale', 0, 0 );
builder.addProperty( 'hueRotation', 0, 0 );
builder.addProperty( 'invert', 0, 0 );
builder.addProperty( 'opacity', 1, 1 );
builder.addProperty( 'saturate', 1, 1 );
builder.addProperty( 'sepia', 0, 0 );

builder.setCSSDefinition( function() {
	var rVal = '';

	if( this.blur > 0 ) {
		rVal += 'blur(' + Math.round( this.blur ) + 'px) ';
	}

	if( this.brightness > 0 ) {
		rVal += 'brightness(' + this.brightness + ') ';
	}

	if( this.contrast != 1 ) {
		rVal += 'contrast(' + this.contrast + ') ';
	}

	if( this.grayScale > 0 ) {
		rVal += 'grayscale(' + this.grayScale + ') ';
	}

	if( this.hueRotation != 0 && this.hueRotation != 360 ) {
		rVal += 'hue-rotate(' + this.hueRotation + 'deg) ';
	}

	if( this.invert > 0 ) {
		rVal += 'invert(' + this.invert + ') ';
	}

	if( this.opacity < 1 ) {
		rVal += 'opacity(' + this.opacity + ') ';
	}

	if( this.saturate != 1 ) {
		rVal += 'saturate(' + this.saturate + ') ';
	}

	if( this.sepia > 0 ) {
		rVal += 'sepia(' + this.sepia + ') ';
	}

	if( this.dropBlur > 0 || this.dropOffY != 0 || this.dropOffX != 0 ) {
		rVal += 'drop-shadow(';

		rVal += Math.round( this.dropOffX ) + 'px ' + Math.round( this.dropOffY ) + 'px ' + Math.round( this.dropBlur ) + 'px ';

		if( this.dropA < 1 ) {
			rVal += 'rgba(' + Math.round( this.dropR ) + ', ' + Math.round( this.dropG ) + ', ' + Math.round( this.dropB ) + ', ' + this.dropA + '))';
		} else {
			rVal += 'rgb(' + Math.round( this.dropR ) + ', ' + Math.round( this.dropG ) + ', ' + Math.round( this.dropB ) + '))';
		}
	}

	if( rVal == '' ) {
		return 'none';
	} else {
		return rVal;
	}
} );

var PropertyFilter = new Class( builder.build() );




var builder = new PropertyClassBuilder( 'PropertyBoxShadow' );
builder.addProperty( 'r', 0, 0 );
builder.addProperty( 'g', 0, 0 );
builder.addProperty( 'b', 0, 0 );
builder.addProperty( 'a', 0, 0 );
builder.addProperty( 'offX', 0, 0 );
builder.addProperty( 'offY', 0, 0 );
builder.addProperty( 'blur', 0, 0 );
builder.addProperty( 'spread', 0, 0 );
builder.addProperty( 'inset', 0, 0 );

builder.setCSSDefinition( function() {
	if( this.blur > 0 || this.offX != 0 || this.offY != 0 ) {
		var rVal = '';

		if( this.a < 1 ) {
			rVal += 'rgba(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ', ' + this.a + ') ';
		} else {
			rVal += 'rgb(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ') ';
		}

		rVal += this.offX + 'px ' + this.offY + 'px ' + this.blur + 'px ' + this.spread + 'px ';

		if( this.dropInset ) {
			rVal += 'inset';
		}

		return rVal;
	} else {
		return 'none';
	}
});


var PropertyBoxShadow = new Class( builder.build() );

//NEED TO HANDLE COLOUR IN THE ABOCE




var REGEX_VALUE_EXTENSION = /^(-?\d+\.?\d*)((px)?(%)?)$/;
var REGEX_VALUE_COLOUR_RGB = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\)$/;
var REGEX_VALUE_BOX_SHADOW = /rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\) (-?\d+)px (-?\d+)px (-?\d+)px( (-?\d+)px( inset)?)?/;

var REGEX_VALUE_FILTER_BLUR = /blur\((\d+)px\)/;
var REGEX_VALUE_FILTER_BRIGHTNESS = /brightness\((-?\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_CONTRAST = /contrast\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_DROP_SHADOW = /drop-shadow\((.+)\)/;
var REGEX_VALUE_FILTER_GRAY_SCALE = /grayscale\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_HUE_ROTATION = /hue-rotate\((\d)+deg\)/;
var REGEX_VALUE_FILTER_INVERT = /invert\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_OPACITY = /opacity\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_SATURATE = /saturate\((\d+\.?\d*)\)/;
var REGEX_VALUE_FILTER_SEPIA = /sepia\((\d+\.?\d*)\)/;












var ParserBase = new Class({
	initialize: function(cssValue) {
		this._cssValue = cssValue;

		this._parseCSSValue();
	},

	_parserDefinition: null,
	_propertyType: null,
	_cssValue: null,
	_value: null,
	

	getValue: function() {
		return this._value.clone();
	},

	setParserDefinition: function( definition ) {
		this._parserDefinition = definition;
	},

	setPropertyType: function( propertyType ) {
		this._propertyType = propertyType;
	},

	_parseCSSValue: function() {
		var propNames = [];
		var propValues = [];

		this._getPropertyArgs( this._parserDefinition, propNames, propValues );

		//the following two lines are pretty nasty but it will construct a new property
		//then apply its constructor on it's self. Only way you can "apply" on a constructor
		this._value = Object.create( this._propertyType.prototype );
		this._value = ( this._propertyType.apply( this._value, propValues ) || this._value );
	},


	_getPropertyArgs: function( definition, propNames, propValues ) {
		//check if this definition level has its own regex
		var regex = definition.regex;
		var props = definition.props;
		
		//if no regex is defined there is an issue
		if( regex == undefined && props == undefined ) {
			throw new Error( 'Paser definition is malformed' );
		}

		if( regex != undefined ) {
			var regexValues = regex.exec( this._cssValue );
		}

		for( var i = 0, len = props.length; i < len; i++ ) {
			//check if theres another regex defined for this child property
			//if so we should recurse to parse out the values for this
			if( props[i].regex == undefined ) {
				
				//did we parse anything for values
				if( regexValues != undefined ) {
					var curVal = regexValues[ props[i].idx ];

					if( curVal == undefined && props[ i ].default !== undefined ) {
						curVal = props[ i ].default;
					}

					propNames.push( props[ i ].name );

					//we want to figure out what type of property we're parsing
					switch( props[ i ].type ) {
						case Number:
							var curNum = parseFloat( curVal );

							if( isNaN(curNum) )
								curNum = 0;

							propValues.push( curNum );
						break;

						case Boolean:
							propValues.push( curVal != undefined );
						break;

						default:
							propValues.push( curVal );
						break;
					}
				} else {
					propNames.push( props[ i ].name );
					propValues.push( undefined );
				}
			} else {
				//since there was a regex defined we should execute that regex as its own prop
				this._getPropertyArgs( props[i], propNames, propValues );
			}
		}
	}
});





function getNewParser( propertyType, parserDefinition ) {
	return new Class({
		Extends: ParserBase,

		initialize: function(cssValue) {
			this.setPropertyType( propertyType );
			this.setParserDefinition( parserDefinition );

			this.parent( cssValue );
		}	
	});
}





var definitionBasicNumber = {
	regex: /.+/, //anything will be parsed to a Number
	props: [
		{ name: 'value', idx: 0, type: Number }
	]
};

var definitionColour = {
	regex: REGEX_VALUE_COLOUR_RGB,
	props: [
		{ name: 'r', idx: 1, type: Number},
		{ name: 'b', idx: 2, type: Number},
		{ name: 'g', idx: 3, type: Number},
		{ name: 'a', idx: 5, type: Number, default: 1 }
	]
};

var definitionBoxShadow = {
	regex: REGEX_VALUE_BOX_SHADOW,
	props: [
		{ name: 'r', idx: 1, type: Number},
		{ name: 'b', idx: 2, type: Number},
		{ name: 'g', idx: 3, type: Number},
		{ name: 'a', idx: 5, type: Number, default: 1 },
		{ name: 'offX', idx: 6, type: Number, default: 0 },
		{ name: 'offY', idx: 7, type: Number, default: 0 },
		{ name: 'blur', idx: 7, type: Number, default: 0 },
		{ name: 'spread', idx: 10, type: Number, default: 0 },
		{ name: 'inset', idx: 11, type: Boolean}
	]
};

var definitionFilter = {
	props: [
		{ regex: REGEX_VALUE_FILTER_BLUR, 
		  props: [ {name: 'blur', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_BRIGHTNESS, 
		  props: [ {name: 'brightness', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_CONTRAST, 
		  props: [ {name: 'contrast', idx: 1, type: Number, default: 1 } ] },

		//note that currently spread and inset are not supported for filter
		{
			regex: REGEX_VALUE_BOX_SHADOW,
			props: [
				{ name: 'r', idx: 1, type: Number},
				{ name: 'b', idx: 2, type: Number},
				{ name: 'g', idx: 3, type: Number},
				{ name: 'a', idx: 5, type: Number, default: 1 },
				{ name: 'offX', idx: 6, type: Number, default: 0 },
				{ name: 'offY', idx: 7, type: Number, default: 0 },
				{ name: 'blur', idx: 7, type: Number, default: 0 }
			]
		},

		{ regex: REGEX_VALUE_FILTER_GRAY_SCALE, 
		  props: [ {name: 'grayScale', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_HUE_ROTATION, 
		  props: [ {name: 'hueRotation', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_INVERT, 
		  props: [ {name: 'invert', idx: 1, type: Number, default: 0 } ] },

		{ regex: REGEX_VALUE_FILTER_OPACITY, 
		  props: [ {name: 'opacity', idx: 1, type: Number, default: 1 } ] },

		{ regex: REGEX_VALUE_FILTER_SATURATE, 
		  props: [ {name: 'saturate', idx: 1, type: Number, default: 1 } ] },

		{ regex: REGEX_VALUE_FILTER_SEPIA, 
		  props: [ {name: 'sepia', idx: 1, type: Number, default: 0 } ] }
	]
};






var ParseNumberValue = getNewParser( PropertyNumber, definitionBasicNumber );
var ParseNumberValueWhole = getNewParser( PropertyNumberWhole, definitionBasicNumber );
var ParserColour = getNewParser( PropertyColour, definitionColour );
var ParserFilter = getNewParser( PropertyFilter, definitionFilter );
var ParseDropShadow = getNewParser( PropertyBoxShadow, definitionBoxShadow );


var ParserLookUp = {};
ParserLookUp['width'] = ParseNumberValueWhole;
ParserLookUp['height'] = ParseNumberValueWhole;
ParserLookUp['left'] = ParseNumberValueWhole;
ParserLookUp['top'] = ParseNumberValueWhole;
ParserLookUp['opacity'] = ParseNumberValue;
ParserLookUp['border-width'] = ParseNumberValueWhole;
ParserLookUp['color'] = ParserColour;
ParserLookUp['background-color'] = ParserColour;
ParserLookUp['-webkit-filter'] = ParserFilter;
ParserLookUp['box-shadow'] = ParseDropShadow;
var Signal=new Class({
	initialize: function()
	{
		this._signalID="signal"+Signal.nextSignalID;
		this._addOnceList={};
		this._listeners=[];

		Signal.nextSignalID++;

		//this ensures that an infinite recursion wont happen
		if(arguments.length==0)
		{
			this.onListenerAdded=new Signal(false);
			this.onListenerRemoved=new Signal(false);
		}
	},

	countListeners: 0,
	onListenerAdded: null,
	onListenerRemoved: null,
	_signalID: 0,
	_addOnceList: null,
	_listeners: null,
	_dispatchStopped: false,

	addOnce: function(listener)
	{
		this.add(listener);

		this._addOnceList[listener.listenerIDX[this._signalID]]=true;
	},
	add: function(listener)
	{
		//if addedID is true here we don't have any ids for this listener
		if(listener.listenerIDX==undefined)
		{
			listener.listenerID=Signal.nextListenerID++;
			listener.listenerIDX={};
		}

		//else we'll have to check if this id is in the list
		if(listener.listenerIDX[this._signalID]==undefined)
		{
			listener.listenerIDX[this._signalID]=this._listeners.length;
			this._listeners[this._listeners.length]=listener;

			this.countListeners++;

			if(this.onListenerAdded!=null)
				this.onListenerAdded.dispatch();
		}
	},
	remove: function(listener)
	{
		if(this._checkHasId(listener))
		{
			var delIDX=listener.listenerIDX[this._signalID];

			//delete the listener
			this._listeners.splice(delIDX, 1);

			//update the index for the listeners
			for(var i=delIDX;i<this._listeners.length;i++)	
			{
				this._listeners[i].listenerIDX[this._signalID]=i;
			}

			this.countListeners--;

			if(this.onListenerRemoved!=null)
				this.onListenerRemoved.dispatch();
		}
	},
	dispatch: function()
	{
		for(var i=0;!this._dispatchStopped && i<this._listeners.length;i++)
		{
			this._listeners[i].apply(null, arguments);

			if(this._addOnceList[i]!=undefined)
			{
				this.remove(this._listeners[i]);

				delete this._addOnceList[i];

				i--;
			}
		}

		this._dispatchStopped=false;
	},
	stopDispatch: function()
	{
		this._dispatchStopped=true;	
	},
	_checkHasId: function(listener)
	{
		return listener.listenerIDX!=undefined && listener.listenerIDX[this._signalID]!=undefined;	
	}
});

Signal.nextSignalID=0;
Signal.nextListenerID=0;

var SpriteSheet = new Class({
	initialize: function( bgImageURL, data ) {
		this.__defineSetter__( 'totalFrames', this.getTotalFrames );

		this._parseData( data );
	},

	getTotalFrames: function() {
		return this._totalFrames;
	},

	getFrameX: function( frame ) {
		throw new Error('You should override this function')
	},

	getFrameY: function( frame ) {
		throw new Error('You should override this function')
	},

	getFrameWidth: function( frame ) {
		throw new Error('You should override this function')
	},

	getFrameHeight: function( frame ) {
		throw new Error('You should override this function')
	},

	_parseData: function( data ) {
		throw new Error('You should override this function')
	}
});


var SpriteSheetAdobeJSONArray = new Class({
	Extends: SpriteSheet,

	_frames: null,

	getOffX: function( frame ) {
		return this._frames[ frame ].spriteSourceSize.x;
	},

	getOffY: function( frame ) {
		return this._frames[ frame ].spriteSourceSize.y;
	},

	getFrameX: function( frame ) {
		return this._frames[ frame ].frame.x;
	},

	getFrameY: function( frame ) {
		return this._frames[ frame ].frame.y;
	},

	getFrameWidth: function( frame ) {
		return this._frames[ frame ].frame.w;
	},

	getFrameHeight: function( frame ) {
		return this._frames[ frame ].frame.h;
	},

	_parseData: function( data ) {
		this._frames = data.frames;
		this._totalFrames = this._frames.length;
	}
});

var EffectSpriteSheet = new Class({
	Extends: Effect,

	initialize: function() {
		this._type =  'EffectSprite';
		this._temp = new PropertyNumber( 0 );

			if( arguments[ 0 ] instanceof jQuery && 
				typeof arguments[ 1 ] == 'string' &&
				typeof arguments[ 2 ] == 'object') {

				this._spriteSheetURL = arguments[ 1 ];
				this._spriteSheetData = arguments[ 2 ];

				//if a parser was passed in
				if( typeof arguments[ 3 ] == 'function' ) {
					this._parserType = arguments[ 3 ];
				} else {
					this._parserType = SpriteSheetAdobeJSONArray;
				}

				this.parent( arguments[0] );
			} else if( typeof arguments[ 0 ] == 'string' &&
					   typeof arguments[ 1 ] == 'object') {

				this._spriteSheetURL = arguments[ 0 ];
				this._spriteSheetData = arguments[ 1 ];

				//if a parser was passed in
				if( typeof arguments[ 2 ] == 'function' ) {
					this._parserType = arguments[ 2 ];
				} else {
					this._parserType = SpriteSheetAdobeJSONArray;
				}

				this.parent();
			} else {
				this._displayInstantiationError();
			}
	},

	_spriteSheetURL: null,
	_spriteSheetData: null,
	_spriteSheetAnimation: null,
	_temp: null,
	_parserType: null,
	_startBGPosition: '0% 0%',
	_startBGRepeate: 'repeat',
	_startBGRImage: 'none',

	setPercentage: function( value ) {
		this.parent( value );

		var frame = Math.floor( value * (this._spriteSheetAnimation.getTotalFrames() - 1) );

		this._itemToEffect.css('background-position', -this._spriteSheetAnimation.getFrameX( frame ) + 'px ' +
												      -this._spriteSheetAnimation.getFrameY( frame ) + 'px');

		var cWidth = this._itemProperties.getEffectChange( this.id, 'width' );
		var cHeight = this._itemProperties.getEffectChange( this.id, 'height' );
		var cLeft = this._itemProperties.getEffectChange( this.id, 'left' );
		var cTop = this._itemProperties.getEffectChange( this.id, 'top' );
		
		this._temp.value = this._spriteSheetAnimation.getFrameWidth( frame );
		this._temp.sub( cWidth );
		this._itemProperties.change( this.id, 'width', this._temp );

		this._temp.value = this._spriteSheetAnimation.getFrameHeight( frame );
		this._temp.sub( cHeight );
		this._itemProperties.change( this.id, 'height', this._temp );

		this._temp.value = this._spriteSheetAnimation.getOffX( frame );
		this._temp.sub( cLeft );
		this._itemProperties.change( this.id, 'left', this._temp );

		this._temp.value = this._spriteSheetAnimation.getOffY( frame );
		this._temp.sub( cTop );
		this._itemProperties.change( this.id, 'top', this._temp );
	},

	setItemToEffect: function( itemToEffect, itemProperties ) {
		this.parent( itemToEffect, itemProperties );

		this._startBGPosition = this._itemToEffect.css( 'background-position' );
		this._startBGRepeate = this._itemToEffect.css( 'background-repeat' );
		this._startBGRImage = this._itemToEffect.css( 'background-image' );

		this._spriteSheetAnimation = new SpriteSheetAdobeJSONArray( this._spriteSheetURL,
																	this._spriteSheetData );

		this._itemToEffect.css( 'background-image', 'url(' + this._spriteSheetURL + ')' );
		this._itemToEffect.css( 'background-repeat', 'no-repeat' );

		this._itemProperties.setupEffect(this, 'width', 'height', 'left', 'top');
	},

	_displayInstantiationError: function() {
		throw new Error( 'When EffectSpriteSheet is intantiated you should pass in either: \n' +
						 'itemToEffect, spriteSheetURL, spriteSheetJSON\n' +
						 'or\n' +
						 'spriteSheetURL, spriteSheetJSON');
	},

	destroy: function() {
		this.parent();

		this._itemToEffect.css( 'background-image', this._startBGRImage );
		this._itemToEffect.css( 'background-repeat', this._startBGRepeate );
		this._itemToEffect.css( 'background-position', this._startBGPosition );
	}
});