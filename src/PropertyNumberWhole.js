define(['Class', 'lib/FancyEffects/src/PropertyClassBuilder'], function(Class, PropertyClassBuilder){

	var builder = new PropertyClassBuilder( 'PropertyNumberWhole' );
	builder.addProperty( 'value', 0, 0 );
	builder.setCSSDefinition( function() {
		return Math.round( this.value );
	});


	var PropertyNumberWhole = new Class( builder.build() );

	return PropertyNumberWhole;

});