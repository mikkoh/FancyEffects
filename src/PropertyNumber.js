define(['Class', 'lib/FancyEffects/src/PropertyClassBuilder'], function(Class, PropertyClassBuilder){

	var builder = new PropertyClassBuilder( 'PropertyNumber' );
	builder.addProperty( 'value', 0, 0 );
	builder.setCSSDefinition( function() {
		return this.value;
	});

	var PropertyNumber = new Class( builder.build() );

	return PropertyNumber;

});