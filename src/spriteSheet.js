
var SpriteSheet = new Class({
	initialize: function(container, bgImageURL, data) {
		this.__defineGetter__( 'currentFrame', this.getCurrentFrame );
		this.__defineSetter__( 'currentFrame', this.setCurrentFrame );
		this.__defineSetter__( 'totalFrames', this.getTotalFrames );

		this._container = container;
		this._container.css( 'background-image', 'url(' + bgImageURL + ')' );
		this._container.css( 'background-repeat', 'no-repeat' );

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
		this.parent( value );
		
		this._container.css( 'width', this._frames[ this._currentFrame ].frame.w );
		this._container.css( 'height', this._frames[ this._currentFrame ].frame.h );
		
		this._container.css( 'background-position', -this._frames[ this._currentFrame ].frame.x + 'px ' +
												    -this._frames[ this._currentFrame ].frame.y + 'px');
	},

	_parseData: function( data ) {
		this._frames = data.frames;
		this._totalFrames = this._frames.length;
	}
});

var EffectSpriteSheet = new Class({
	Extends: Effect,

	initialize: function() {
		if( arguments.length == 3 ) {

			if( arguments[ 0 ] instanceof jQuery && 
				typeof arguments[ 1 ] == 'string' &&
				typeof arguments[ 2 ] == 'object') {

				this._spriteSheetURL = arguments[ 1 ];
				this._spriteSheetData = arguments[ 2 ];

				this.parent( arguments[0] );
			} else {
				this._displayInstantiationError();
			}

		} else if( arguments.length == 2 ) {

			if( typeof arguments[ 0 ] == 'string' &&
				typeof arguments[ 1 ] == 'object') {

				this._spriteSheetURL = arguments[ 0 ];
				this._spriteSheetData = arguments[ 1 ];

				this.parent();
			} else {
				this._displayInstantiationError();
			}

		} else {
			this._displayInstantiationError();
		}
	},

	_spriteSheetURL: null,
	_spriteSheetData: null,
	_spriteSheetAnimation: null,

	setPercentage: function( value ) {
		this.parent( value );

		this._spriteSheetAnimation.setCurrentFrame( value * (this._spriteSheetAnimation.getTotalFrames() - 1) );
	},

	setItemToEffect: function( itemToEffect, itemProperties ) {
		this.parent( itemToEffect, itemProperties );

		this._spriteSheetAnimation = new SpriteSheetAdobeJSONArray( itemToEffect, 
																	this._spriteSheetURL,
																	this._spriteSheetData );
	},

	_displayInstantiationError: function() {
		throw new Error( 'When EffectSpriteSheet is intantiated you should pass in either: \n' +
						 'itemToEffect, spriteSheetURL, spriteSheetJSON\n' +
						 'or\n' +
						 'spriteSheetURL, spriteSheetJSON');
	}
});