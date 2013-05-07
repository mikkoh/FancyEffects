define(['Class', 'lib/FancyEffects/src/PropertyClassBuilder'], function(Class, PropertyClassBuilder){

	var builder = new PropertyClassBuilder( 'PropertyBoxShadow' );
	builder.addProperty( 'r', 0, 0 );
	builder.addProperty( 'g', 0, 0 );
	builder.addProperty( 'b', 0, 0 );
	builder.addProperty( 'a', 0, 0 );
	builder.addProperty( 'offX', 0, 0 );
	builder.addProperty( 'offY', 0, 0 );
	builder.addProperty( 'blur', 0, 0 );
	builder.addProperty( 'spread', 0, 0 );
	builder.addProperty( 'inset', 0, 0 );

	builder.setCSSDefinition( function() {
		if( this.blur > 0 || this.offX != 0 || this.offY != 0 ) {
			var rVal = '';

			if( this.a < 1 ) {
				rVal += 'rgba(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ', ' + this.a + ') ';
			} else {
				rVal += 'rgb(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ') ';
			}

			rVal += this.offX + 'px ' + this.offY + 'px ' + this.blur + 'px ' + this.spread + 'px ';

			if( this.dropInset ) {
				rVal += 'inset';
			}

			return rVal;
		} else {
			return 'none';
		}
	});


	var PropertyBoxShadow = new Class( builder.build() );

	return PropertyBoxShadow;

	//NEED TO HANDLE COLOUR IN THE ABOCE

});