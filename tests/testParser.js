test( "Parser", function() {
	var boxPink=$('#pinkBox');
	var boxBlue=$('#blueBox');

	/***** PARSE COLOUR *****/
	var colourParserPink=new ParserColour(boxPink.css('background-color'));
	var colourParserBlue=new ParserColour(boxBlue.css('background-color'));

//153
	ok(colourParserPink.getValue().getCSS()=="rgb(255, 0, 255)", "Pink Background-Color Parse" );
	ok(colourParserBlue.getValue().getCSS()=="rgb(0, 0, 153)", "Blue Background-Color Parse" );
});