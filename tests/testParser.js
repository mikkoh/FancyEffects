test( "Parser", function() {
	var boxPink=$('#pinkBox');
	var boxBlue=$('#blueBox');
	var boxGreen=$('#greenBox');
	var boxAlpha=$('#alphaBox');

	/***** PARSE COLOUR *****/
	var colourParserPink=new ParserColour(boxPink.css('background-color'));
	var colourParserBlue=new ParserColour(boxBlue.css('background-color'));
	var colourParserGreen=new ParserColour(boxGreen.css('background-color'));
	var colourParserAlpha=new ParserColour(boxAlpha.css('background-color'));

	ok(colourParserPink.getValue().getCSS()=="rgba(255, 0, 255, 1)", "Pink Background-Color Parse" );
	ok(colourParserBlue.getValue().getCSS()=="rgba(0, 0, 153, 1)", "Blue Background-Color Parse" );
	ok(colourParserGreen.getValue().getCSS()=="rgba(127, 255, 0, 1)", "Green Background-Color Parse" );
	ok(colourParserAlpha.getValue().getCSS()=="rgba(255, 255, 0, 0.5)", "Alpha Background-Color Parse" );
});