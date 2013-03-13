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
var easing = {};

easing.ElasticEaseOut = function( t, b, c, d, a, p ) {
	if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
}

var EffectPercentage = new Class({
	Extends: Effect,

	setItemToEffect: function( effect ) {
		this._itemToEffect = effect;
	}
});

var EffectPercentageElasticEaseOut = new Class({
	Extends: EffectPercentage,

	setPercentage: function(value) {
		this._itemToEffect.effectPercentage( easing.ElasticEaseOut( value, 0, 1, 1 ) );
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
				} else if( this._percentageToApply > this._effectEnd[ effect.id ] ) {
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
				} else if( this._percentageToApply > this._effectEnd[ this._effects[i].id ] ) {
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


		this._id = EffectIds.getId( this._type );

		this._effectIdx = {};
		this._effects = [];

		this._effectEffectIdx = {};
		this._effectEffects = [];

		if (itemToEffect) {
			this.setItemToEffect( itemToEffect );
		}
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
	},
	effectPercentage: function( percentage ) {
		this._percentageToApply += percentage;
	},
	reset: function() {
		this._itemProperties.resetAll(this.id);
	},
	destroy: function() {
		this.reset();

		for (var i = 0; i < this._effects.length; i++) {
			this._effects[i].destroy();
		}

		ItemPropertiesBank.destroy( this._itemToEffect );
		this._effects.length = 0;
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
			if( this._effectIdx[effect.id] === undefined ) {
				this._effectIdx[effect.id] = this._effects.length;
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
			this._startValue = this._itemProperties.getStart(this._propertyToEffect).clone();
			this._itemProperties.getStart(this._propertyToEffect).onPropertyChange.add(this._onStartValueChange.bind(this));
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

		this._tempChangeAmount = new PropertyNumber();
		this._modifiedStart = new PropertyNumber();
		this._modifiedEnd = new PropertyNumber();
	}
});


var EffectChangePropColour = new Class({
	Extends: EffectChangeProp,

	initialize: function() {
		this._type = 'EffectChangePropColour';

		var startVal = undefined;
		var endVal = undefined;

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
			} else if ( arguments.length > 0 ) {
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
	
		this._tempChangeAmount = new PropertyColour();
		this._modifiedStart = new PropertyColour();
		this._modifiedEnd = new PropertyColour();
	}
});
var EffectWidth = new Class({
	Extends: EffectChangePropNumber,

	initialize: function() {
		this._type =  'EffectWidth';
		this._propertyToEffect = 'width';
		this.parent.apply(this, arguments);
	}
});


var EffectHeight = new Class({
	Extends: EffectChangePropNumber,

	initialize: function() {
		this._type =  'EffectHeight';
		this._propertyToEffect = 'height';
		this.parent.apply(this, arguments);
	}
});


var EffectLeft = new Class({
	Extends: EffectChangePropNumber,
	initialize: function() {
		this._type =  'EffectLeft';
		this._propertyToEffect = 'left';
		this.parent.apply(this, arguments);
	}
});

var EffectTop = new Class({
	Extends: EffectChangePropNumber,
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
	Extends: EffectChangePropNumber,
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


/* COMPOSITE EFFECTS */
var EffectMoveUpAndFade = new Class({
	Extends: Effect,
	initialize: function(itemToEffect, offY) {
		this._type = 'EffectMoveUpAndFade';

		this._effFade = new EffectOpacity(0, 1);
		this._effMove = new EffectTop(offY == undefined ? 200 : offY);

		this.add(this._effFade);
		this.add(this._effMove);

		this.parent(itemToEffect);
	},

	_effFade: null,
	_effMove: null,

	setPercentage: function(value) {
		this._effFade.percentage = value;
		this._effMove.percentage = 1 - value;
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

			if( property == 'opacity' )
				console.log( 'enable', property, this._propertyValue[ property ].getCSS() );
		}
	},
	disable: function( effectID, property ) {
		if( this._enabled[ effectID ][ property ] ) {
			this._enabled[ effectID ][ property ] = false;

			if( property == 'opacity' )
				console.log( 'disable', property,  this._changeAmountForEffect[ effectID ][ property ].value );

			this._propertyValue[property].sub( this._changeAmountForEffect[ effectID ][ property ] );

			this._itemToEffect.css(property, this._propertyValue[property].getCSS());
		}
	},
	reset: function( effectID, property ) {
		this._propertyValue[property].sub(this._changeAmountForEffect[effectID][property]);
		
		this._changeAmountForEffect[effectID][property].reset();

		this._itemToEffect.css(property, this._propertyValue[property].getCSS());
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
		this._changeAmountForEffect[ effectID ][ property ] = ParserClass.getZeroProperty();
	}
});


var Property = new Class({
	onPropertyChange: null,

	initialize: function() {
		this.onPropertyChange = new Signal();
	},

	add: function(otherItem) {
		throw new Error('You must override this function');
		return this;
	},
	sub: function(otherItem) {
		throw new Error('You must override this function');
		return this;
	},
	mulScalar: function(scalar) {
		throw new Error('You must override this function');
		return this;
	},
	equals: function(otherItem) {
		throw new Error('You must override this function');
		return this;
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		throw new Error('You must override this function');
		return this;
	},
	getCSS: function() {
		throw new Error('You must override this function');
	},
	clone: function() {
		throw new Error('You must override this function');
	}
});

var PropertyNumber = new Class({
	Extends: Property,

	initialize: function(value) {
		this.parent();

		this.__defineGetter__('value', this.getValue);
		this.__defineSetter__('value', this.setValue);

		this._value = value == undefined ? 0 : value;
	},

	_value: 0,

	getValue: function() {
		return this._value;
	},
	setValue: function(value) {
		this._value = value;
		this.onPropertyChange.dispatch();
	},
	add: function(otherItem) {
		this._value += otherItem.value;

		return this;
	},
	sub: function(otherItem) {
		this._value -= otherItem.value;

		return this;
	},
	mulScalar: function(scalar) {
		this._value *= scalar;

		return this;
	},
	equals: function(otherItem) {
		this._value = otherItem.value;

		return this;
	},
	reset: function() {
		this._value = 0;
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this._value = (endValue.value - startValue.value) * percentage + startValue.value;

		this._value -= curValue.value;

		return this;
	},
	getCSS: function() {
		return this._value;
	},
	clone: function() {
		return new PropertyNumber(this._value);
	}
});

var PropertyColour = new Class({
	Extends: Property,

	initialize: function(r, g, b, a) {
		this.parent();

		this.__defineGetter__('r', this.getR);
		this.__defineGetter__('g', this.getG);
		this.__defineGetter__('b', this.getB);
		this.__defineGetter__('a', this.getA);

		this.__defineSetter__('r', this.setR);
		this.__defineSetter__('g', this.setG);
		this.__defineSetter__('b', this.setB);
		this.__defineSetter__('a', this.setA);

		this._r = r == undefined ? 0 : parseFloat(r);
		this._g = g == undefined ? 0 : parseFloat(g);
		this._b = b == undefined ? 0 : parseFloat(b);
		this._a = a == undefined || isNaN(a) ? 1 : parseFloat(a);
	},

	_r: 0,
	_g: 0,
	_b: 0,
	_a: 1,

	getR: function() {
		return this._r;
	},
	getG: function() {
		return this._g;
	},
	getB: function() {
		return this._b;
	},
	getA: function() {
		return this._a;
	},
	setR: function(value) {
		this._r = value;

		this.onPropertyChange.dispatch();
	},
	setG: function(value) {
		this._g = value;

		this.onPropertyChange.dispatch();
	},
	setB: function(value) {
		this._b = value;

		this.onPropertyChange.dispatch();
	},
	setA: function(value) {
		this._a = value;

		this.onPropertyChange.dispatch();
	},
	add: function(otherItem) {
		this._r += otherItem.r;
		this._g += otherItem.g;
		this._b += otherItem.b;
		this._a += otherItem.a;

		return this;
	},
	sub: function(otherItem) {
		this._r -= otherItem.r;
		this._g -= otherItem.g;
		this._b -= otherItem.b;
		this._a -= otherItem.a;

		return this;
	},
	mulScalar: function(scalar) {
		this._r *= scalar;
		this._g *= scalar;
		this._b *= scalar;
		this._a *= scalar;

		return this;
	},
	equals: function(startVal) {
		this._r = startVal.r;
		this._g = startVal.g;
		this._b = startVal.b;
		this._a = startVal.a;

		return this;
	},
	reset: function() {
		this._r = 0;
		this._g = 0;
		this._b = 0;
		this._a = 1;
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this._r = (endValue.r - startValue.r) * percentage + startValue.r;
		this._g = (endValue.g - startValue.g) * percentage + startValue.g;
		this._b = (endValue.b - startValue.b) * percentage + startValue.b;
		this._a = (endValue.a - startValue.a) * percentage + startValue.a;

		this._r -= curValue.r;
		this._g -= curValue.g;
		this._b -= curValue.b;
		this._a -= curValue.a;

		return this;
	},
	getCSS: function() {
		if (this.a == 1) {
			return 'rgb(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ')';
		} else {
			return 'rgba(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ', ' + this.a + ')';
		}
	},
	clone: function() {
		var rVal = new PropertyColour(this.r, this.g, this.b, this.a);

		return rVal;
	},
	toString: function() {
		return this._r + ', ' + this._g + ', ' + this._b + ', ' + this._a;
	}
});

var PropertyFilter = new Class({
	Extends: Property,

	initialize: function(blur, brightness, contrast, dropShadow, grayScale, hueRotation, invert, opacity, saturate, sepia) {
		this.parent();

		this.__defineGetter__('blur', this.getBlur);
		this.__defineGetter__('brightness', this.getBrightness);
		this.__defineGetter__('contrast', this.getContrast);
		this.__defineGetter__('dropShadow', this.getDropShadow);
		this.__defineGetter__('grayScale', this.getGrayScale);
		this.__defineGetter__('hueRotation', this.getHueRotation);
		this.__defineGetter__('invert', this.getInvert);
		this.__defineGetter__('opacity', this.getOpacity);
		this.__defineGetter__('saturate', this.getSaturate);
		this.__defineGetter__('sepia', this.getSepia);

		this.__defineSetter__('blur', this.setBlur);
		this.__defineSetter__('brightness', this.setBrightness);
		this.__defineSetter__('contrast', this.setContrast);
		this.__defineSetter__('dropShadow', this.setDropShadow);
		this.__defineSetter__('grayScale', this.setGrayScale);
		this.__defineSetter__('hueRotation', this.setHueRotation);
		this.__defineSetter__('invert', this.setInvert);
		this.__defineSetter__('opacity', this.setOpacity);
		this.__defineSetter__('saturate', this.setSaturate);
		this.__defineSetter__('sepia', this.setSepia);

		this._blur = blur == undefined ? 0 : blur;
		this._brightness = brightness == undefined ? 0 : brightness;
		this._contrast = contrast == undefined ? 1 : contrast;
		this._dropShadow = dropShadow == undefined ? new PropertyBoxShadow() : dropShadow;
		this._grayScale = grayScale == undefined ? 0 : grayScale;
		this._hueRotation = hueRotation == undefined ? 0 : hueRotation;
		this._invert = invert == undefined ? 0 : invert;
		this._opacity = opacity == undefined ? 1 : opacity;
		this._saturate = saturate == undefined ? 1 : saturate;
		this._sepia = sepia == undefined ? 0 : sepia;
	},

	_blur: 0,
	_brightness: 0,
	_contrast: 1,
	_dropShadow: null,
	_grayScale: 0,
	_hueRotation: 0,
	_invert: 0,
	_opacity: 1,
	_saturate: 1,
	_sepia: 0,

	getBlur: function() {
		return this._blur;
	},
	getBrightness: function() {
		return this._brightness;
	},
	getContrast: function() {
		return this._contrast;
	},
	getDropShadow: function() {
		return this._dropShadow;
	},
	getGrayScale: function() {
		return this._grayScale;
	},
	getHueRotation: function() {
		return this._hueRotation;
	},
	getInvert: function() {
		return this._invert;
	},
	getOpacity: function() {
		return this._opacity;
	},
	getSaturate: function() {
		return this._saturate;
	},
	getSepia: function() {
		return this._sepia;
	},
	setPropertyChange: function(value) {
		this.parent(value);

		this.dropShadow.onPropertyChange = value;
	},
	setBlur: function(value) {
		this._blur = value;

		this.onPropertyChange.dispatch();
	},
	setBrightness: function(value) {
		this._brightness = value;
		this.onPropertyChange.dispatch();
	},
	setContrast: function(value) {
		this._contrast = value;
		this.onPropertyChange.dispatch();
	},
	setDropShadow: function(value) {
		this._dropShadow = value;
		this.onPropertyChange.dispatch();
	},
	setGrayScale: function(value) {
		this._grayScale = value;

		this.onPropertyChange.dispatch();
	},
	setHueRotation: function(value) {
		this._hueRotation = value;
		this.onPropertyChange.dispatch();
	},
	setInvert: function(value) {
		this._invert = value;
		this.onPropertyChange.dispatch();
	},
	setOpacity: function(value) {
		this._opacity = value;
		this.onPropertyChange.dispatch();
	},
	setSaturate: function(value) {
		this._saturate = value;
		this.onPropertyChange.dispatch();
	},
	setSepia: function(value) {
		this._sepia = value;
		this.onPropertyChange.dispatch();
	},
	add: function(otherItem) {
		this._blur += otherItem.blur;
		this._brightness += otherItem.brightness;
		this._contrast += otherItem.contrast;
		this._grayScale += otherItem.grayScale;
		this._hueRotation += otherItem.hueRotation;
		this._invert += otherItem.invert;
		this._opacity += otherItem.opacity;
		this._saturate += otherItem.saturate;
		this._sepia += otherItem.sepia;

		this.dropShadow.add(otherItem.dropShadow);

		return this;
	},
	sub: function(otherItem) {
		this._blur -= otherItem.blur;
		this._brightness -= otherItem.brightness;
		this._contrast -= otherItem.contrast;
		this._grayScale -= otherItem.grayScale;
		this._hueRotation -= otherItem.hueRotation;
		this._invert -= otherItem.invert;
		this._opacity -= otherItem.opacity;
		this._saturate -= otherItem.saturate;
		this._sepia -= otherItem.sepia;

		this.dropShadow.sub(otherItem.dropShadow);

		return this;
	},
	mulScalar: function(scalar) {
		this._blur *= scalar;
		this._brightness *= scalar;
		this._contrast *= scalar;
		this._grayScale *= scalar;
		this._hueRotation *= scalar;
		this._invert *= scalar;
		this._opacity *= scalar;
		this._saturate *= scalar;
		this._sepia *= scalar;

		return this;
	},
	equals: function(otherItem) {
		this._blur = otherItem.blur;
		this._brightness = otherItem.brightness;
		this._contrast = otherItem.contrast;
		this._grayScale = otherItem.grayScale;
		this._hueRotation = otherItem.hueRotation;
		this._invert = otherItem.invert;
		this._opacity = otherItem.opacity;
		this._saturate = otherItem.saturate;
		this._sepia = otherItem.sepia;

		return this;
	},
	reset: function() {
		this._blur = 0;
		this._brightness = 0;
		this._contrast = 1;
		this._grayScale = 0;
		this._hueRotation = 0;
		this._invert = 0;
		this._opacity = 1;
		this._saturate = 1;
		this._sepia = 0;

		this._dropShadow.reset();
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this._blur = (endValue.blur - startValue.blur) * percentage + startValue.blur;
		this._brightness = (endValue.brightness - startValue.brightness) * percentage + startValue.brightness;
		this._contrast = (endValue.contrast - startValue.contrast) * percentage + startValue.contrast;
		this._grayScale = (endValue.grayScale - startValue.grayScale) * percentage + startValue.grayScale;
		this._hueRotation = (endValue.hueRotation - startValue.hueRotation) * percentage + startValue.hueRotation;
		this._invert = (endValue.invert - startValue.invert) * percentage + startValue.invert;
		this._opacity = (endValue.opacity - startValue.opacity) * percentage + startValue.opacity;
		this._saturate = (endValue.saturate - startValue.saturate) * percentage + startValue.saturate;
		this._sepia = (endValue.sepia - startValue.sepia) * percentage + startValue.sepia;

		this._blur -= curValue.blur;
		this._brightness -= curValue.brightness;
		this._contrast -= curValue.contrast;
		this._grayScale -= curValue.grayScale;
		this._hueRotation -= curValue.hueRotation;
		this._invert -= curValue.invert;
		this._opacity -= curValue.opacity;
		this._saturate -= curValue.saturate;
		this._sepia -= curValue.sepia;

		this.dropShadow.getChange(percentage, curValue.dropShadow, startValue.dropShadow, endValue.dropShadow);

		return this;
	},
	getCSS: function() {
		var rVal = '';

		if (this._blur > 0) {
			rVal += 'blur(' + Math.round(this._blur) + 'px) ';
		}

		if (this._brightness > 0) {
			rVal += 'brightness(' + this._brightness + ') ';
		}

		if (this._contrast != 1) {
			rVal += 'contrast(' + this._contrast + ') ';
		}

		if (this._grayScale > 0) {
			rVal += 'grayscale(' + this._grayScale + ') ';
		}

		if (this._hueRotation > 0 && this._hueRotation < 360) {
			rVal += 'hue-rotate(' + this._hueRotation + 'deg) ';
		}

		if (this._invert > 0) {
			rVal += 'invert(' + this._invert + ') ';
		}

		if (this._opacity < 1) {
			rVal += 'opacity(' + this._opacity + ') ';
		}

		if (this._saturate != 1) {
			rVal += 'saturate(' + this._saturate + ') ';
		}

		if (this._sepia > 0) {
			rVal += 'sepia(' + this._sepia + ')';
		}

		if (this._dropShadow.isNotDefault()) rVal += 'drop-shadow(' + this._dropShadow.getCSS() + ') ';

		if (rVal == '') rVal = 'none';

		return rVal;
	},
	clone: function() {
		return new PropertyFilter(this._blur,
		this._brightness,
		this._contrast,
		this._dropShadow.clone(),
		this._grayScale,
		this._hueRotation,
		this._invert,
		this._opacity,
		this._saturate,
		this._sepia);
	}
});

var PropertyBoxShadow = new Class({
	Extends: PropertyColour,

	initialize: function(r, g, b, a, offX, offY, blur, spread, inset) {
		this.__defineGetter__('offX', this.getOffX);
		this.__defineGetter__('offY', this.getOffY);
		this.__defineGetter__('blur', this.getBlur);
		this.__defineGetter__('spread', this.getSpread);
		this.__defineGetter__('inset', this.getInset);
		this.__defineSetter__('offX', this.setOffX);
		this.__defineSetter__('offY', this.setOffY);
		this.__defineSetter__('blur', this.setBlur);
		this.__defineSetter__('spread', this.setSpread);
		this.__defineSetter__('inset', this.setInset);

		this._offX = offX == undefined ? 0 : parseFloat(offX);
		this._offY = offY == undefined ? 0 : parseFloat(offY);
		this._blur = blur == undefined ? 0 : parseFloat(blur);
		this._spread = spread == undefined ? 0 : parseFloat(spread);
		this._inset = inset == 'inset';

		this.parent(r, g, b, a);
	},

	_offX: 0,
	_offY: 0,
	_blur: 0,
	_spread: 0,
	_inset: false,

	getOffX: function() {
		return this._offX
	},
	getOffY: function() {
		return this._offY
	},
	getBlur: function() {
		return this._blur
	},
	getSpread: function() {
		return this._spread
	},
	getInset: function() {
		return this._inset
	},
	setOffX: function(value) {
		this._offX = value;
		this.onPropertyChange.dispatch();
	},
	setOffY: function(value) {
		this._offY = value;
		this.onPropertyChange.dispatch();
	},
	setBlur: function(value) {
		this._blur = value;
		this.onPropertyChange.dispatch();
	},
	setSpread: function(value) {
		this._spread = value;
		this.onPropertyChange.dispatch();
	},
	setInset: function(value) {
		this._inset = value;
		this.onPropertyChange.dispatch();
	},
	isNotDefault: function() {
		return this._offX != 0 || this._offY != 0 || this._blur != 0 || this._spread != 0;
	},
	add: function(otherItem) {
		this.parent(otherItem);

		this._offX += otherItem.offX;
		this._offY += otherItem.offY;
		this._blur += otherItem.blur;
		this._spread += otherItem.spread;

		return this;
	},
	sub: function(otherItem) {
		this.parent(otherItem);

		this._offX -= otherItem.offX;
		this._offY -= otherItem.offY;
		this._blur -= otherItem.blur;
		this._spread -= otherItem.spread;

		return this;
	},
	mulScalar: function(scalar) {
		this._offX *= scalar;
		this._offY *= scalar;
		this._blur *= scalar;
		this._spread *= scalar;

		return this;
	},
	equals: function(otherItem) {
		this.parent(otherItem);

		this._offX = otherItem.offX;
		this._offY = otherItem.offY;
		this._blur = otherItem.blur;
		this._spread = otherItem.spread;

		return this;
	},
	reset: function() {
		this._offX = 0;
		this._offY = 0;
		this._blur = 0;
		this._spread = 0;
		this._inset = false;
	},
	getChange: function(percentage, curValue, startValue, endValue) {
		this.parent(percentage, curValue, startValue, endValue);

		this._offX = (endValue.offX - startValue.offX) * percentage + startValue.offX;
		this._offY = (endValue.offY - startValue.offY) * percentage + startValue.offY;
		this._blur = (endValue.blur - startValue.blur) * percentage + startValue.blur;
		this._spread = (endValue.spread - startValue.spread) * percentage + startValue.spread;

		this._offX -= curValue.offX;
		this._offY -= curValue.offY;
		this._blur -= curValue.blur;
		this._spread -= curValue.spread;

		return this;
	},
	getCSS: function() {
		var rVal = this.parent() + ' ';

		rVal += Math.round(this.offX) + 'px ' + Math.round(this.offY) + 'px ';

		if (this.blur > 0) rVal += Math.round(this.blur) + 'px ';

		if (this.spread > 0) rVal += Math.round(this.spread) + 'px ';

		if (this.inset) rVal += 'inset';

		return rVal;
	},
	clone: function() {
		return new PropertyBoxShadow(this._r,
		this._g,
		this._b,
		this._a,
		this._offY,
		this._offY,
		this._blur,
		this._spread,
		this._inset);
	}
});
var REGEX_VALUE_EXTENSION = /^(-?\d+\.?\d*)((px)?(%)?)$/;
var REGEX_VALUE_COLOUR_RGB = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\)$/;
var REGEX_VALUE_BOX_SHADOW = /^rgba?\((\d+), *(\d+), *(\d+)(, *(\d+\.?\d*))?\) (-?\d+)px (-?\d+)px (-?\d+)px( (-?\d+)px( inset)?)?$/;

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

var Parser = new Class({
	initialize: function(cssValue) {
		this._cssValue = cssValue;

		this._parseCSSValue();
	},

	_cssValue: null,
	_value: null,

	getValue: function() {
		return this._value.clone();
	},
	getZeroProperty: function() {
		throw new Error('You need to override this function');
	},
	_parseCSSValue: function() {
		throw new Error('You need to override this function');
	}
});

var ParseNumberValue = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var valueResult = REGEX_VALUE_EXTENSION.exec(this._cssValue);

		if( valueResult != null )
			this._value = new PropertyNumber( parseFloat( valueResult[1]) );
		else
			this._value = new PropertyNumber();
	}
});

ParseNumberValue.getZeroProperty = function() {
	return new PropertyNumber(0);
};


var ParserColour = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var valArr = REGEX_VALUE_COLOUR_RGB.exec(this._cssValue);

		if (valArr != undefined) {
			//we're doing something funky here with ALPHA because jquery may have a bug
			//when css is set to 0.5 jQuery returns 0.498046875 which is 127.5/255
			//we just drop the precision slightly in hopes that it will be more acurate
			//I know it's sort of bad
			this._value = new PropertyColour( parseFloat(valArr[1]), 
											  parseFloat(valArr[2]), 
											  parseFloat(valArr[3]), 
											  parseFloat(parseFloat(valArr[5]).toPrecision(2)) );
		} else {
			this._value = new PropertyColour();
		}
	}
});

ParserColour.getZeroProperty = function() {
	return new PropertyColour(0, 0, 0, 0);
};



var ParserFilter = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var blur = REGEX_VALUE_FILTER_BLUR.exec(this._cssValue);
		var brightness = REGEX_VALUE_FILTER_BRIGHTNESS.exec(this._cssValue);
		var contrast = REGEX_VALUE_FILTER_CONTRAST.exec(this._cssValue);
		var grayScale = REGEX_VALUE_FILTER_GRAY_SCALE.exec(this._cssValue);
		var hueRotation = REGEX_VALUE_FILTER_HUE_ROTATION.exec(this._cssValue);
		var invert = REGEX_VALUE_FILTER_INVERT.exec(this._cssValue);
		var opacity = REGEX_VALUE_FILTER_OPACITY.exec(this._cssValue);
		var saturate = REGEX_VALUE_FILTER_SATURATE.exec(this._cssValue);
		var sepia = REGEX_VALUE_FILTER_SEPIA.exec(this._cssValue);

		var dropShadow = REGEX_VALUE_FILTER_DROP_SHADOW.exec(this._cssValue);
		var dropShadowVal = undefined;

		if(dropShadow) {
			dropShadowVal = (new ParseDropShadow(dropShadow[1])).getValue();
		} else {
			dropShadowVal = new PropertyBoxShadow();
		}

		this._value = new PropertyFilter(blur==undefined ? 0 : parseFloat(blur[1]),
										 brightness == undefined ? 0 : parseFloat(brightness[1]),
										 contrast == undefined ? 1 : parseFloat(contrast[1]),
										 dropShadowVal,
										 grayScale == undefined ? 0 : parseFloat(grayScale[1]),
										 hueRotation == undefined ? 0 : parseFloat(hueRotation[1]),
										 invert == undefined ? 0 : parseFloat(invert[1]),
										 opacity == undefined ? 1 : parseFloat(opacity[1]),
										 saturate == undefined ? 1 : parseFloat(saturate[1]),
										 sepia == undefined ? 0 : parseFloat(sepia[1]));
	}
});

ParserFilter.getZeroProperty = function() {
	return new PropertyFilter(0, 0, 0, ParseDropShadow.getZeroProperty(), 0, 0, 0, 0, 0, 0);
};


var ParseDropShadow = new Class({
	Extends: Parser,

	_parseCSSValue: function() {
		var valArr = REGEX_VALUE_BOX_SHADOW.exec(this._cssValue);
		
		if ( valArr ) {
			this._value = new PropertyBoxShadow( valArr[1], //r
												 valArr[2], //g
												 valArr[3], //b
												 valArr[5], //a
												 valArr[6], //offX
												 valArr[7], //offY
												 valArr[8], //blur
												 valArr[10], //spread
												 valArr[11] ); //inset
		} else {
			this._value = new PropertyBoxShadow();
		}
	}
});

ParseDropShadow.getZeroProperty=function() {
		return new PropertyBoxShadow( 0, 0, 0, 0, 0, 0, 0, 0 );
};

var ParserLookUp = {};
ParserLookUp['width'] = ParseNumberValue;
ParserLookUp['height'] = ParseNumberValue;
ParserLookUp['left'] = ParseNumberValue;
ParserLookUp['top'] = ParseNumberValue;
ParserLookUp['opacity'] = ParseNumberValue;
ParserLookUp['border-width'] = ParseNumberValue;
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
	initialize: function(container, bgImageURL, data) {
		this.__defineGetter__( 'currentFrame', this.getCurrentFrame );
		this.__defineSetter__( 'currentFrame', this.setCurrentFrame );
		this.__defineSetter__( 'totalFrames', this.getTotalFrames );

		this._container = container;
		this._container.css( 'background-image', bgImageURL );
		this._container.css( 'background-repeat', 'no-repeat' );
		this._container.css( 'background-attachment', 'fixed' );

		this._parseData( data );

		this.setCurrentFrame( 0 );
	},

	_container: null,
	_currentFrame: 0,
	_totalFrames: 0,

	setCurrentFrame: function( value ) {
		this._currentFrame = Math.floor( value ) % this._totalFrames;
	},

	getCurrentFrame: function() {
		return this._currentFrame;
	},

	getTotalFrames: function() {
		return this._totalFrames;
	},

	_parseData: function( data ) {
		throw new Error('You should override this function')
	}
});


var SpriteSheetAdobeJSONArray = new Class({
	Extends: SpriteSheet,

	_frames: null,

	setCurrentFrame: function( value ) {
		this.super( value );

		this._container.css( 'width', this._frames[ value ].spriteSourceSize.w );
		this._container.css( 'height', this._frames[ value ].spriteSourceSize.h );
		this._container.css( 'background-position', this._frames[ this._currentFrame ].spriteSourceSize.x + 'px ' +
												    this._frames[ this._currentFrame ].spriteSourceSize.y + 'px');
	},

	_parseData: function( data ) {
		this._frames = data.frames;
	}
});