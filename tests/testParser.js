test( "Parser", function() {
	var boxPink=$('#pinkBox');
	var boxBlue=$('#blueBox');
	var boxGreen=$('#greenBox');
	var boxAlpha=$('#alphaBox');
	var boxHSL=$('#hslBox');

	/***** PARSE COLOUR *****/
	var colourParserPink=new ParserColour(boxPink.css('background-color'));
	var colourParserBlue=new ParserColour(boxBlue.css('background-color'));
	var colourParserGreen=new ParserColour(boxGreen.css('background-color'));
	var colourParserAlpha=new ParserColour(boxAlpha.css('background-color'));
	var colourParserHSL=new ParserColour(boxHSL.css('background-color'));

	ok(colourParserPink.getValue().getCSS()=="rgb(255, 0, 255)", "Pink Background-Color Parse" );
	ok(colourParserBlue.getValue().getCSS()=="rgb(0, 0, 153)", "Blue Background-Color Parse" );
	ok(colourParserGreen.getValue().getCSS()=="rgb(127, 255, 0)", "Green Background-Color Parse" );
	ok(colourParserAlpha.getValue().getCSS()=="rgba(255, 255, 0, 0.5)", "Alpha Background-Color Parse" );
	ok(colourParserHSL.getValue().getCSS()=="rgb(255, 0, 0)", "Alpha Background-Color Parse" );
	
});