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



		for( var i = 1; i < this._numItems; i++ ) {
			itemProperties = ItemPropertiesBank.get( arguments[ i ] );

			//now setup all the timeline effects
			var startPerc = ( i - 1 ) / this._numItems;
			var endPerc = i / this._numItems;

			var bottom = startItemTop + startItemHeight;


			//zero the position of this item
			this._initPosEffects.push( new EffectLeft( arguments[ i ], startItemLeft, startItemLeft) );
			//this._initPosEffects.push( new EffectTop( arguments[ i ], startItemTop, startItemTop) );


			this.add( new EffectTop( arguments[ i - 1 ], startItemTop, bottom ), startPerc, endPerc );
			this.add( new EffectHeight( arguments[ i - 1 ], startItemHeight, 0 ), startPerc, endPerc );

			//make it 0 till the end
			this.add( new EffectTop( arguments[ i - 1 ], bottom, bottom ), endPerc, 1 );
			this.add( new EffectHeight( arguments[ i - 1 ], 0, 0 ), endPerc, 1 );


			this.add( new EffectTop( arguments[ i ], startItemTop, startItemTop ), startPerc, endPerc );
			this.add( new EffectHeight( arguments[ i ], 0, startItemHeight ), startPerc, endPerc );

			//make it 0 before the end
			this.add( new EffectHeight( arguments[ i ], 0, 0 ), 0, startPerc );
		}

		this.setPercentage( 0 );
	},

	_numItems: 0,
	_initPosEffects: null,

	animateToItem: function( idx, duration ) {
		var targetPerc = idx / (this._numItems - 1);

		this.animate( targetPerc, Math.abs( targetPerc - this.percentage ) * duration );
	}
});