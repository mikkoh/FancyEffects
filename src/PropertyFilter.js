define(['Class', 'lib/FancyEffects/src/PropertyClassBuilder'], function(Class, PropertyClassBuilder){

	var builder = new PropertyClassBuilder( 'PropertyFilter' );
	builder.addProperty( 'blur', 0, 0 );
	builder.addProperty( 'brightness', 0, 0 );
	builder.addProperty( 'contrast', 1, 1 );
	builder.addProperty( 'dropR', 0, 0 );
	builder.addProperty( 'dropG', 0, 0 );
	builder.addProperty( 'dropB', 0, 0 );
	builder.addProperty( 'dropA', 1, 1 );
	builder.addProperty( 'dropOffX', 0, 0 );
	builder.addProperty( 'dropOffY', 0, 0 );
	builder.addProperty( 'dropBlur', 0, 0 );
	builder.addProperty( 'dropSpread', 0, 0 );
	builder.addProperty( 'dropInset', 0, 0 );
	builder.addProperty( 'grayScale', 0, 0 );
	builder.addProperty( 'hueRotation', 0, 0 );
	builder.addProperty( 'invert', 0, 0 );
	builder.addProperty( 'opacity', 1, 1 );
	builder.addProperty( 'saturate', 1, 1 );
	builder.addProperty( 'sepia', 0, 0 );

	builder.setCSSDefinition( function() {
		var rVal = '';

		if( this.blur > 0 ) {
			rVal += 'blur(' + Math.round( this.blur ) + 'px) ';
		}

		if( this.brightness > 0 ) {
			rVal += 'brightness(' + this.brightness + ') ';
		}

		if( this.contrast != 1 ) {
			rVal += 'contrast(' + this.contrast + ') ';
		}

		if( this.grayScale > 0 ) {
			rVal += 'grayscale(' + this.grayScale + ') ';
		}

		if( this.hueRotation != 0 && this.hueRotation != 360 ) {
			rVal += 'hue-rotate(' + this.hueRotation + 'deg) ';
		}

		if( this.invert > 0 ) {
			rVal += 'invert(' + this.invert + ') ';
		}

		if( this.opacity < 1 ) {
			rVal += 'opacity(' + this.opacity + ') ';
		}

		if( this.saturate != 1 ) {
			rVal += 'saturate(' + this.saturate + ') ';
		}

		if( this.sepia > 0 ) {
			rVal += 'sepia(' + this.sepia + ') ';
		}

		if( this.dropBlur > 0 || this.dropOffY != 0 || this.dropOffX != 0 ) {
			rVal += 'drop-shadow(';

			rVal += Math.round( this.dropOffX ) + 'px ' + Math.round( this.dropOffY ) + 'px ' + Math.round( this.dropBlur ) + 'px ';

			if( this.dropA < 1 ) {
				rVal += 'rgba(' + Math.round( this.dropR ) + ', ' + Math.round( this.dropG ) + ', ' + Math.round( this.dropB ) + ', ' + this.dropA + '))';
			} else {
				rVal += 'rgb(' + Math.round( this.dropR ) + ', ' + Math.round( this.dropG ) + ', ' + Math.round( this.dropB ) + '))';
			}
		}

		if( rVal == '' ) {
			return 'none';
		} else {
			return rVal;
		}
	} );

	var PropertyFilter = new Class( builder.build() );

	return PropertyFilter;

});