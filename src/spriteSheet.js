
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
	_temp: null,

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
	}
});