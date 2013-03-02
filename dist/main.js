$(function() {
	var effWidth = new EffectWidth();
	var effHeight = new EffectHeight();
	var effLeft = new EffectLeft();
	var effTop = new EffectTop();
	var effOpacity = new EffectOpacity();
	var effBorderWidth = new EffectBorderWidth();
	var effColor = new EffectColor();
	var effBGColor = new EffectBackgroundColor();

	var eff = new Effect($('#itemToEffect'));
	eff.add(effWidth);
	eff.add(effHeight);
	eff.add(effTop);
	eff.add(effLeft);
	eff.add(effOpacity);
	eff.add(effBorderWidth);
	eff.add(effColor);
	eff.add(effBGColor);

	var gui = new dat.GUI();
	var folderMain = gui.addFolder('Main Controller');
	folderMain.add(eff, 'percentage', 0, 1);
	folderMain.open();

	var folderWidth = gui.addFolder('width effect');
	folderWidth.add(effWidth, 'start').min(0).max(200);
	folderWidth.add(effWidth, 'end').min(0).max(200);

	var folderHeight = gui.addFolder('height effect');
	folderHeight.add(effHeight, 'start').min(0).max(200);
	folderHeight.add(effHeight, 'end').min(0).max(200);

	var folderLeft = gui.addFolder('top effect');
	folderLeft.add(effTop, 'start').min(0).max(980);
	folderLeft.add(effTop, 'end').min(0).max(980);

	var folderLeft = gui.addFolder('left effect');
	folderLeft.add(effLeft, 'start').min(0).max(980);
	folderLeft.add(effLeft, 'end').min(0).max(980);

	var folderOpacity = gui.addFolder('opacity effect');
	folderOpacity.add(effOpacity, 'start').min(0).max(1);
	folderOpacity.add(effOpacity, 'end').min(0).max(1);

	var borderWidth = gui.addFolder('border width');
	borderWidth.add(effBorderWidth, 'start').min(0).max(100);
	borderWidth.add(effBorderWidth, 'end').min(0).max(100);

	var color = gui.addFolder('color');
	color.add(effColor.start, 'r').min(0).max(255);
	color.add(effColor.start, 'g').min(0).max(255);
	color.add(effColor.start, 'b').min(0).max(255);
	color.add(effColor.end, 'r').min(0).max(255);
	color.add(effColor.end, 'g').min(0).max(255);
	color.add(effColor.end, 'b').min(0).max(255);

	var backgroundColor = gui.addFolder('background color');
	backgroundColor.add(effBGColor.start, 'r').min(0).max(255);
	backgroundColor.add(effBGColor.start, 'g').min(0).max(255);
	backgroundColor.add(effBGColor.start, 'b').min(0).max(255);
	backgroundColor.add(effBGColor.end, 'r').min(0).max(255);
	backgroundColor.add(effBGColor.end, 'g').min(0).max(255);
	backgroundColor.add(effBGColor.end, 'b').min(0).max(255);
});