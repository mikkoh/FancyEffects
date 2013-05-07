define(['Class',
	'lib/FancyEffects/src/Parsers',
	'lib/FancyEffects/src/PropertyNumberWhole'
	], function(Class, Parsers, PropertyNumberWhole){

	var ItemProperties = new Class({
		initialize: function(itemToEffect) {
			this._itemToEffect = itemToEffect;
			this._propertiesWatching = {};
			this._propertyValue = {};
			this._propertyStartValue = {};
			this._changeAmountForEffect = {};
			this._enabled = {};
		},

		_itemToEffect: null,
		_propertiesWatching: null,
		_propertyValue: null,
		_changeAmountForEffect: null,
		_enabled: null,

		setupEffect: function( effect ) {
			var effectID = effect.id;

			if (!this._changeAmountForEffect[ effectID ]) {
				this._changeAmountForEffect[ effectID ] = {};
				this._enabled[ effectID ] = {};

				for (var i = 1; i < arguments.length; i++) {
					var property = arguments[i];

					this._setupProperty( effectID, property );
				}
			}
		},
		get: function( property ) {
			return this._propertyValue[ property ];
		},
		getStart: function( property ) {
			return this._propertyStartValue[ property ];
		},
		getEffectChange: function( effectID, property ) {
			return this._changeAmountForEffect[ effectID ][ property ];
		},
		change: function( effectID, property, amount ) {
			this._propertyValue[ property ].add( amount );

			this._changeAmountForEffect[ effectID ][ property ].add( amount );

			this._itemToEffect.css( property, this._propertyValue[ property ].getCSS() );
		},
		enable: function( effectID, property ) {
			if( !this._enabled[ effectID ][ property ] ) {
				this._enabled[ effectID ][ property ] = true;
				this._propertyValue[property].add( this._changeAmountForEffect[ effectID ][ property ] );

				this._itemToEffect.css(property, this._propertyValue[property].getCSS());
			}
		},
		disable: function( effectID, property ) {
			if( this._enabled[ effectID ][ property ] ) {
				this._enabled[ effectID ][ property ] = false;

				this._propertyValue[property].sub( this._changeAmountForEffect[ effectID ][ property ] );

				this._itemToEffect.css(property, this._propertyValue[property].getCSS());
			}
		},
		reset: function( effectID, property ) {
			if( this._enabled[ effectID ][ property ] ) {
				this._propertyValue[property].sub( this._changeAmountForEffect[effectID][property] );
				
				this._changeAmountForEffect[effectID][property].reset();

				this._itemToEffect.css(property, this._propertyValue[property].getCSS());
			}
		},
		resetAll: function( effectID ) {
			for (var i in this._changeAmountForEffect[effectID]) {
				this.reset(effectID, i);
			}
		},
		_setupProperty: function( effectID, property ) {
			var ParserClass = Parsers[property];


			if (!this._propertiesWatching[property]) {
				if (ParserClass) {
					this._propertiesWatching[property] = true;

					var parser = new ParserClass( this._itemToEffect.css( property ) );

					var startPropVal = this._propertyStartValue[ property ] = parser.getValue(); //new ParserClass( parser._value ); //
					var propVal = this._propertyValue[ property ] = parser.getValue(); // ew ParserClass( parser._value );

					//the following is to make sure that the current property value gets "reset"
					//if someone goes in and changes the start value
					this._propertyStartValue[ property ].onPropertyChange.add( function(){
						propVal.equals( startPropVal );
					});
				} else {
					throw new Error('There is no parser defined for ' + property);
				}
			}

			this._enabled[ effectID ][ property ] = true;
			this._changeAmountForEffect[ effectID ][ property ] = this._propertyStartValue[ property ].getZero();
		}
	});

	return ItemProperties;

});