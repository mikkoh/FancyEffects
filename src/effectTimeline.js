define(['Class', 'lib/FancyEffects/src/Effect', 'lib/FancyEffects/src/Track'], function(Class, Effect, Track){

	var EffectTimeline = new Class({
		Extends: Effect,

		initialize: function( ) {
			this._type = 'EffectTimeline';
			this._tracksById = {};
			this._tracks = [];
			this._effectStart = {};
			this._effectEnd = {};
			this._effectDuration = {};

			this.parent();
		},

		_tracksById: null,
		_tracks: null,
		_effectStart: null,
		_effectEnd: null,
		_effectDuration: null,

		createTrack: function( effect, id ) {
			var nTrack = new Track( effect );

			if( id === undefined ) {
				this._tracksById[ id ] = nTrack;
			}

			this._tracks.push( nTrack );

			return nTrack;
		},

		getTrack: function( id ) {
			return this._tracksById[ id ];
		},

		setPercentage: function( value ) {
			for( var i = 0, len = this._tracks.length; i < len; i++ ) {
				this._tracks[ i ].setPercentage( value );
			}

			this.parent( value );
		}
	});

	return EffectTimeline;

});