	/***************************************************************
	****************************************************************
	****************************************************************
	******** NOTE THE FOLLOWING ARE PENNER EASING EQUATIONS ********
	******** ROBERT PENNER IS THE MAN ******************************
	****************************************************************
	******** Copyright © 2001 Robert Penner ************************
	******** All rights reserved. **********************************
	****************************************************************
	***************************************************************/

define([], function(){

	var easing = {};


	//SINE
	easing.SineEaseIn = function( t, b, c, d ) {
		return -c * Math.cos(t/d * PI_D2) + c + b;
	};

	easing.SineEaseOut = function( t, b, c, d ) {
		return c * Math.sin(t/d * PI_D2) + b;
	};

	easing.SineEaseInOut = function( t, b, c, d ) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	};


	//QUINT
	easing.QuintEaseIn = function( t, b, c, d ) {
		return c*(t/=d)*t*t*t*t + b;
	};

	easing.QuintEaseOut = function( t, b, c, d ) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	};

	easing.QuintEaseInOut = function( t, b, c, d ) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	};


	//QUART
	easing.QuartEaseIn = function( t, b, c, d ) {
		return c*(t/=d)*t*t*t + b;
	};

	easing.QuartEaseOut = function( t, b, c, d ) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	};

	easing.QuartEaseInOut = function( t, b, c, d ) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	};


	//QUAD
	easing.QuadEaseIn = function( t, b, c, d ) {
		return c*(t/=d)*t + b;
	};

	easing.QuadEaseOut = function( t, b, c, d ) {
		return -c *(t/=d)*(t-2) + b;
	};

	easing.QuadEaseInOut = function( t, b, c, d ) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	};


	//EXPO
	easing.ExpoEaseIn = function( t, b, c, d ) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	};

	easing.ExpoEaseOut = function( t, b, c, d ) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	};

	easing.ExpoEaseInOut = function( t, b, c, d ) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	};


	//ELASTIC
	easing.ElasticEaseIn = function( t, b, c, d, a, p ) {
		var s;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; s=p/4; }
		else s = p/PI_M2 * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*PI_M2/p )) + b;
	};

	easing.ElasticEaseOut = function( t, b, c, d, a, p ) {
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
	};

	easing.ElasticEaseInOut = function( t, b, c, d, a, p ) {
		var s;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (!a || a < Math.abs(c)) { a=c; s=p/4; }
		else s = p/PI_M2 * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*PI_M2/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*PI_M2/p )*.5 + c + b;
	};


	//CIRCULAR
	easing.CircularEaseIn = function( t, b, c, d ) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	};

	easing.CircularEaseOut = function( t, b, c, d ) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	};

	easing.CircularEaseInOut = function( t, b, c, d ) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	};


	//BACK
	easing.BackEaseIn = function( t, b, c, d, s ) {
		if( s == undefined ) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	};

	easing.BackEaseOut = function( t, b, c, d, s ) {
		if( s == undefined ) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	};

	easing.BackEaseInOut = function( t, b, c, d, s ) {
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	};


	//BOUNCE
	easing.BounceEaseIn = function( t, b, c, d ) {
		return c - easeOutBounce (d-t, 0, c, d) + b;
	};

	easing.BounceEaseOut = function( t, b, c, d ) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	};

	easing.BounceEaseInOut = function( t, b, c, d ) {
		if (t < d/2) return easeInBounce (t*2, 0, c, d) * .5 + b;
		else return easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
	};


	//CUBIC
	easing.CubicEaseIn = function( t, b, c, d ) {
		return c*(t/=d)*t*t + b;
	};

	easing.CubicEaseOut = function( t, b, c, d ) {
		return c*((t=t/d-1)*t*t + 1) + b;
	};

	easing.CubicEaseInOut = function( t, b, c, d ) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	};

	return easing;

});
