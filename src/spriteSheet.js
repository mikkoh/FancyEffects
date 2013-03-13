
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