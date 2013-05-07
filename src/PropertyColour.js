define(['Class', 'lib/FancyEffects/src/PropertyClassBuilder'], function(Class, PropertyClassBuilder){

	var builder = new PropertyClassBuilder( 'PropertyColour' );
	builder.addProperty( 'r', 0, 0 );
	builder.addProperty( 'g', 0, 0 );
	builder.addProperty( 'b', 0, 0 );
	builder.addProperty( 'a', 1, 1 );
	builder.setCSSDefinition( function() { 
		if( this.a < 1 ) {
			return 'rgba(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ', ' + this.a + ')';
		} else {
			return 'rgb(' + Math.round( this.r ) + ', ' + Math.round( this.g ) + ', ' + Math.round( this.b ) + ')';
		}
	} );


	var PropertyColour = new Class( builder.build() );

	return PropertyColour;

});