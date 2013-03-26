var MoveItemToItem = new Class({
	Extends: EffectTimeline,

	initialize: function() {
		this.parent();

		this._numItems = arguments.length;

		var positions = [];

		//since we're going to be using these positions over and over again I will
		//cache them for further use so we don't have to use jQuery position over
		//and over again
		for( var i = 0, len = arguments.length; i < len; i++ ) {
			positions[ i ] = arguments[i].position();
		}

		var lastItemIdx = len - 1;
		var startItemPos = positions[ 0 ];

		for( var i = 1; i < len; i++ ) {
			var startPerc = (i - 1) / lastItemIdx;
			var endPerc = i / lastItemIdx;
			
			var prevItemPos = positions[ i -1 ];
			var curItemPos = positions[ i ];
			var prevEndOffX = startItemPos.left - prevItemPos.left;
			var prevEndOffY = startItemPos.top - prevItemPos.top;
			var endOffX = startItemPos.left - curItemPos.left;
			var endOffY = startItemPos.top - curItemPos.top;

			for( var j = 0; j < len; j++ ) {
				var itemToEffect = arguments[ j ];
				var itemToEffectPos = positions[ j ];
				var startOffX = itemToEffectPos.left;
				var startOffY = itemToEffectPos.top;
				
				this.add( new EffectLeft( itemToEffect, itemToEffectPos.left + prevEndOffX, itemToEffectPos.left + endOffX ), startPerc, endPerc );
				this.add( new EffectTop( itemToEffect, itemToEffectPos.top + prevEndOffY, itemToEffectPos.top + endOffY ), startPerc, endPerc );
			}			
		}
	},

	_numItems: 0,

	animateToItem: function( idx, duration ) {
		var targetPerc = idx / (this._numItems - 1);

		this.animate( targetPerc, Math.abs( targetPerc - this.percentage ) * duration );
	}
})