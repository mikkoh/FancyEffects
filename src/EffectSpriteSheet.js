define(['Class', 'lib/FancyEffects/src/PropertyNumber', 'lib/FancyEffects/src/Effect', 'lib/FancyEffects/src/spriteSheetParsers/SpriteSheetAdobeJSONArray' ], 
function(Class, PropertyNumber, Effect, SpriteSheetAdobeJSONArray ){
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
		_startWidth: 0,
		_startHeight: 0,

		setPercentage: function( value ) {
			this.parent( value );

			var frame = Math.floor( value * (this._spriteSheetAnimation.getTotalFrames() - 1) );

			this._itemToEffect.css('background-position', -this._spriteSheetAnimation.getFrameX( frame ) + 'px ' +
													      -this._spriteSheetAnimation.getFrameY( frame ) + 'px');

			var cWidth = this._itemProperties.getEffectChange( this.id, 'width' );
			var cHeight = this._itemProperties.getEffectChange( this.id, 'height' );
			var cLeft = this._itemProperties.getEffectChange( this.id, 'left' );
			var cTop = this._itemProperties.getEffectChange( this.id, 'top' );
		
			this._temp.value = -this._startWidth + this._spriteSheetAnimation.getFrameWidth( frame );
			this._temp.sub( cWidth );
			this._itemProperties.change( this.id, 'width', this._temp );

			this._temp.value = -this._startHeight + this._spriteSheetAnimation.getFrameHeight( frame );
			this._temp.sub( cHeight );
			this._itemProperties.change( this.id, 'height', this._temp );

			this._temp.value = this._spriteSheetAnimation.getOffX( frame );
			this._temp.sub( cLeft );
			this._itemProperties.change( this.id, 'left', this._temp );

			this._temp.value = this._spriteSheetAnimation.getOffY( frame );
			this._temp.sub( cTop );
			this._itemProperties.change( this.id, 'top', this._temp );
		},

		getDuration: function( frameRate ) {
			frameRate = frameRate == undefined ? 30 : frameRate;

			return this._spriteSheetAnimation.getTotalFrames() / frameRate;
		},

		playToStart: function( frameRate, onComplete ) {
			var duration = this.getDuration( frameRate );

			this.animate( 0, duration, onComplete );
		},

		playToEnd: function( frameRate, onComplete ) {
			var duration = this.getDuration( frameRate );

			this.animate( 1, duration, onComplete );
		},

		setItemToEffect: function( itemToEffect, itemProperties ) {
			this.parent( itemToEffect, itemProperties );

			this._startBGPosition = this._itemToEffect.css( 'background-position' );
			this._startBGRepeate = this._itemToEffect.css( 'background-repeat' );
			this._startBGRImage = this._itemToEffect.css( 'background-image' );
			this._startWidth = itemToEffect.width();
			this._startHeight = itemToEffect.height();

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

	return EffectSpriteSheet;
});