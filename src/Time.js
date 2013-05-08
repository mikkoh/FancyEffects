define(['lib/FancyEffects/src/Signal'], function(Signal){

	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function( callback ){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();

	var Time = {};

	Time.deltaTime = 0;
	Time.scale = 1;
	Time.onEnterFrame = new Signal();

	Time.setTargetFrameRate = function(frameRate) {
		Time._targetMilli = 1000 / frameRate;
	};

	Time._targetMilli = 1000 / 60;
	Time._lastCallTime = 0;
	Time._allowOnEnterFrame = false;

	Time._onEnterFrameFunction = function() {
		var curCallTime = Date.now();
		
		Time.deltaTime = curCallTime - Time._lastCallTime;

		Time.scale = Time.deltaTime / Time._targetMilli;

		if (isNaN(Time.scale)) Time.scale = 1;

		Time.onEnterFrame.dispatch();

		if (Time._allowOnEnterFrame) requestAnimFrame(Time._onEnterFrameFunction);
		else Time.scale = 1;

		Time._lastCallTime = curCallTime;
	};

	Time.onEnterFrame.onListenerAdded.add( function() {
		Time._allowOnEnterFrame = true;
		Time._onEnterFrameFunction();
	});

	Time.onEnterFrame.onListenerRemoved.add( function() {
		if (Time.onEnterFrame.countListeners == 0) Time._allowOnEnterFrame = false;
	});

	return Time;

});