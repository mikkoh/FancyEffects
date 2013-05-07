define(['Class', 'lib/FancyEffects/src/PropertyClassBuilder'], function(Class, PropertyClassBuilder){

	var builder = new PropertyClassBuilder( 'PropertyNumberWhole' );
	builder.addProperty( 'value', 0, 0 );
	builder.setCSSDefinition( function() {
		return Math.round( this.value );
	});

	var Cloneable = null;
	var PropertyNumberWhole = new Class( builder.build() );
	Cloneable = PropertyNumberWhole;

	return PropertyNumberWhole;

});