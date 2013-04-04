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