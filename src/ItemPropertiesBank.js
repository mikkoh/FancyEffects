define(['lib/FancyEffects/src/ItemProperties'], function(ItemProperties){

	var ItemPropertiesBank = {};
	ItemPropertiesBank.curKey = 0;
	ItemPropertiesBank.items = {};
	ItemPropertiesBank.itemCount = {};

	ItemPropertiesBank.get = function( jQueryItem ) {
		var rVal = null;

		if( jQueryItem[0].$itemPropertiesIndex === undefined ) {
			jQueryItem[0].$itemPropertiesIndex = ItemPropertiesBank.curKey;
			ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ] = 1;

			rVal = new ItemProperties( jQueryItem );
			ItemPropertiesBank.items[ ItemPropertiesBank.curKey ] = rVal;

			ItemPropertiesBank.curKey++;
		} else {
			rVal = ItemPropertiesBank.items[ jQueryItem[0].$itemPropertiesIndex ];
			ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ]++;
		}

		return rVal;
	}

	ItemPropertiesBank.destroy = function( jQueryItem ) {
		if( jQueryItem[0].$itemPropertiesIndex !== undefined ) {
			ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ]--;

			if( ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ] == 0) {
				delete ItemPropertiesBank[ jQueryItem[0].$itemPropertiesIndex ];
				delete ItemPropertiesBank.itemCount[ jQueryItem[0].$itemPropertiesIndex ];
				delete jQueryItem[0].$itemPropertiesIndex;	
			}
		}
	}

	return ItemPropertiesBank;

});