define([ 'Class', 'lib/FancyEffects/src/spriteSheetParsers/SpriteSheet' ], function( Class, SpriteSheet ){
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

	return SpriteSheetAdobeJSONArray;
});