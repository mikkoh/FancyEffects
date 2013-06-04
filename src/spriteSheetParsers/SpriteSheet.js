define([ 'Class' ], function( Class ){

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

	return SpriteSheet;
});