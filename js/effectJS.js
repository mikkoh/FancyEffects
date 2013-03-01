(function()
{
	var ItemProperties=new Class({
		initialize: function(itemToEffect)
		{
			this._itemToEffect=itemToEffect;
			this._propertiesWatching={};
			this._propertyValue={};
			this._propertyStartValue={};
			this._changeAmountForEffect={};
		},

		_itemToEffect: null,
		_propertiesWatching: null,
		_propertyValue: null,
		_changeAmountForEffect: null,

		setupEffect: function(effect)
		{
			var effectID=effect.id;

			if(!this._changeAmountForEffect[effectID])
			{
				this._changeAmountForEffect[effectID]={};

				for(var i=1;i<arguments.length;i++)
				{
					var property=arguments[i];

					this._setupPropery(property);
					this._changeAmountForEffect[effectID][property]=0;
				}
			}
		},
		get: function(property)
		{
			return this._propertyValue[property];
		},
		getStart: function(property)
		{
			return this._propertyStartValue[property];
		},
		change: function(effectID, property, amount)
		{	
			this._propertyValue[property]+=amount;
			this._changeAmountForEffect[effectID][property]+=amount;
			this._itemToEffect.css(property, this._propertyValue[property]);
		},
		reset: function(effectID, property)
		{
			this._propertyValue[property]-=this._changeAmountForEffect[effectID][property];
			this._itemToEffect.css(property, this._propertyValue[property]);
			this._changeAmountForEffect[effectID][property]=0;
		},
		_setupPropery: function(property)
		{
			if(!this._propertiesWatching[property])
			{
				var ParserClass=ParserLookUp[property];
			
				if(ParserClass)
				{
					this._propertiesWatching[property]=true;

					var parser=new ParserClass(this._itemToEffect.css(property));

					this._propertyStartValue[property]=parser.getValue();
					this._propertyValue[property]=this._propertyStartValue[property];
				}
				else
				{
					throw new Error('There is no parser defined for '+property);
				}
			}
		}
	});

	var REGEX_VALUE_EXTENSION=/^(\d+\.?\d*)((px)?(%)?)$/;
	var REGEX_VALUE_COLOUR_RGB=/^rgb\((\d+), *(\d+), *(\d+)\)$/

	var Parser=new Class({
		initialize: function(cssValue)
		{
			this._cssValue=cssValue;

			this._parseCSSValue();
		},

		getValue: function()
		{
			throw new Error('You need to override this function');
		},
		_parseCSSValue: function()
		{
			throw new Error('You need to override this function');
		}
	});

	var ParseNumberValue=new Class({
		Extends: Parser,

		_value: 0,

		getValue: function()
		{
			return this._value;
		},
		_parseCSSValue: function()
		{
			var valueResult=REGEX_VALUE_EXTENSION.exec(this._cssValue);

			if(valueResult)
				this._value=parseFloat(valueResult[1]);
			else
				this._value=0;	
		}
	});

	var ParserColour=new Class({
		Extends: Parser,

		_r: 0,
		_g: 0,
		_b: 0,

		getValue: function()
		{
			return this;
		},
		_parseCSSValue: function()
		{
			if(REGEX_VALUE_COLOUR_RGB.test(this._cssValue))
			{
				var valArr=REGEX_VALUE_COLOUR_RGB.exec(this._cssValue);

				this._r=parseFloat(valArr[1]);
				this._g=parseFloat(valArr[2]);
				this._b=parseFloat(valArr[3]);
			}
		}
	});

	var ParserLookUp={};
	ParserLookUp['width']=ParseNumberValue;
	ParserLookUp['height']=ParseNumberValue;
	ParserLookUp['left']=ParseNumberValue;
	ParserLookUp['top']=ParseNumberValue;
	ParserLookUp['opacity']=ParseNumberValue;
	ParserLookUp['border-width']=ParseNumberValue;






	/******************************************************************************************/
	/******************************************************************************************/
	/***************************************EFFECTS********************************************/
	/******************************************************************************************/
	/******************************************************************************************/
	var Effect=new Class({
		initialize: function(itemToEffect)
		{
			this._effects=[];

			if(itemToEffect)
				this.setItemToEffect(itemToEffect);

			this.__proto__.__defineSetter__('percentage', this.setPercentage);
			this.__proto__.__defineGetter__('percentage', this.getPercentage);
			this.__proto__.__defineGetter__('id', this.getId);
		},

		_id: 'Effect',
		_itemToEffect: null,
		_itemProperties: null,
		_percentage: 0,
		_effects: null,
		
		getId: function()
		{
			return this._id;
		},
		setItemToEffect: function(itemToEffect, itemProperties)
		{
			this._itemToEffect=itemToEffect;

			if(itemProperties)
				this._itemProperties=itemProperties;
			else
				this._itemProperties=new ItemProperties(itemToEffect);
		},
		getPercentage: function()
		{
			return this._percentage;
		},
		setPercentage: function(value)
		{
			this._percentage=value;

			for(var i=0;i<this._effects.length;i++)
			{
				this._effects[i].setPercentage(value);
			}
		},
		add: function(effect)
		{
			this._effects.push(effect);
			effect.setItemToEffect(this._itemToEffect, this._itemProperties);
			effect.percentage=this.percentage;
		},
		remove: function(effect)
		{

		}
	});






	var EffectChangeProp=new Class({
		Extends: Effect,
		initialize: function()
		{
			/*
			ONE ARGUMENT: 
							propertyToEffect
			TWO ARGUMENTS: 
							itemToEffect, propertyToEffect
							propertyToEffect, endValue

			THREE ARUGMENTS: 
						 	itemToEffect, propertyToEffect, endValue
						 	propertyToEffect, startValue, endValue
							

			FOUR ARGUMENTS: 
							itemToEffect, propertyToEffect, startValue, endValue
			*/
			if(typeof arguments[0]=='string')
			{
				this._propertyToEffect=arguments[0];

				if(arguments[2]!==undefined)
				{
					this._startValue=arguments[1];
					this._endValue=arguments[2];
				}
				else if(arguments[1]!==undefined)
				{
					this._endValue=arguments[1];
				}

				this.parent();
			}
			else
			{
				if(arguments.length==4)
				{
					this._startValue=arguments[2];
					this._endValue=arguments[3];
				}
				else if(arguments.length==3)
				{
					this._endValue=arguments[2];
				}
				else
				{
					this._endValue=100;
				}

				this._propertyToEffect=arguments[1];
				this.parent(arguments[0]);
			}

			this.__defineGetter__('start', this.getStartValue);
			this.__defineSetter__('start', this.setStartValue);
			this.__defineGetter__('end', this.getEndValue);
			this.__defineSetter__('end', this.setEndValue);
		},

		_startValue: NaN,
		_endValue: NaN,
		_propertyToEffect: null,

		setPercentage: function(value)
		{
			this.parent(value);

			var cValue=this._itemProperties.get(this._propertyToEffect);
			var nValue=(this._endValue-this._startValue)*value+this._startValue;

			this._itemProperties.change(this.id, this._propertyToEffect, nValue-cValue);
		},
		setItemToEffect: function(itemToEffect, itemProperties)
		{
			this.parent(itemToEffect, itemProperties);

			this._itemProperties.setupEffect(this, this._propertyToEffect);

			if(isNaN(this._startValue))
				this._startValue=this._itemProperties.getStart(this._propertyToEffect);

			if(isNaN(this._endValue))
				this._endValue=this._itemProperties.getStart(this._propertyToEffect);
		},
		getStartValue: function()
		{
			return this._startValue;
		},
		setStartValue: function(value)
		{
			this._startValue=value;

			this.setPercentage(this._percentage);
		},
		getEndValue: function()
		{
			return this._endValue;
		},
		setEndValue: function(value)
		{
			this._endValue=value;

			this.setPercentage(this._percentage);
		}
	});





	var EffectWidth=new Class({
		Extends: EffectChangeProp,
		initialize: function()
		{
			this._id='EffectWidth';

			if(typeof arguments[0]=='object')
				this.parent(arguments[0], 'width', arguments[1], arguments[2]);
			else
				this.parent('width', arguments[0], arguments[1]);
		}
	});

	var EffectHeight=new Class({
		Extends: EffectChangeProp,
		initialize: function()
		{
			this._id='EffectHeight';

			if(typeof arguments[0]=='object')
				this.parent(arguments[0], 'height', arguments[1], arguments[2]);
			else
				this.parent('height', arguments[0], arguments[1]);
		}
	});

	var EffectLeft=new Class({
		Extends: EffectChangeProp,
		initialize: function()
		{
			this._id='EffectLeft';

			if(typeof arguments[0]=='object')
				this.parent(arguments[0], 'left', arguments[1], arguments[2]);
			else
				this.parent('left', arguments[0], arguments[1]);
		}
	});

	var EffectTop=new Class({
		Extends: EffectChangeProp,
		initialize: function()
		{
			this._id='EffectTop';

			if(typeof arguments[0]=='object')
				this.parent(arguments[0], 'top', arguments[1], arguments[2]);
			else
				this.parent('top', arguments[0], arguments[1]);
		}
	});

	var EffectOpacity=new Class({
		Extends: EffectChangeProp,
		initialize: function()
		{
			this._id='EffectOpacity';

			if(typeof arguments[0]=='object')
				this.parent(arguments[0], 'opacity', arguments[1], arguments[2]);
			else
				this.parent('opacity', arguments[0], arguments[1]);
		}
	});

	var EffectBorderWidth=new Class({
		Extends: EffectChangeProp,
		initialize: function()
		{
			this._id='EffectBorderWidth';

			if(typeof arguments[0]=='border-width')
				this.parent(arguments[0], 'border-width', arguments[1], arguments[2]);
			else
				this.parent('border-width', arguments[0], arguments[1]);
		}
	});






	/* COMPOSITE EFFECTS */
	var EffectMoveUpAndFade=new Class({
		Extends: Effect,
		initialize: function(itemToEffect, offY)
		{
			this.parent(itemToEffect);

			this._effFade=new EffectOpacity(0, 1);
			this._effMove=new EffectTop(offY==undefined?200:offY);

			this.add(this._effFade);
			this.add(this._effMove);
		},

		_effFade: null,
		_effMove: null,

		setPercentage: function(value)
		{
			this._effFade.percentage=value;
			this._effMove.percentage=1-value;
		}
	});

	//Stuff to allow outside this scope
	//Basic
	this.Effect=Effect;
	this.EffectWidth=EffectWidth;
	this.EffectHeight=EffectHeight;
	this.EffectLeft=EffectLeft;
	this.EffectTop=EffectTop;
	this.EffectOpacity=EffectOpacity;
	this.EffectBorderWidth=EffectBorderWidth;

	//Composites
	this.EffectMoveUpAndFade=EffectMoveUpAndFade;


	/* TODO:
		-parse out things like transform, filter
		-write a property manager for colours
		-implement destroying effects
		-handle changing properties like position
			-have a counter for when the property should be reset to start value
		-handle changing the start value
			-effects that did not have a start value sent to them should be updated
		-create a timeline of effects
		-create curves for effects
	*/
})();







$(function(){
	//*
	var effWidth=new EffectWidth();
	var effHeight=new EffectHeight();
	var effLeft=new EffectLeft();
	var effTop=new EffectTop();
	var effOpacity=new EffectOpacity();
	var effBorderWidth=new EffectBorderWidth();

	var eff=new Effect($('#itemToEffect'));
	eff.add(effWidth);
	eff.add(effTop);
	eff.add(effLeft);
	eff.add(effOpacity);
	eff.add(effBorderWidth);

	eff.percentage=0.8;



	var gui=new dat.GUI();
	var folderMain=gui.addFolder('Main Controller');
	folderMain.add(eff, 'percentage', 0, 1);
	folderMain.open();

	var folderWidth=gui.addFolder('width effect');
	folderWidth.add(effWidth, 'start').min(0).max(200);
	folderWidth.add(effWidth, 'end').min(0).max(200);

	var folderLeft=gui.addFolder('top effect');
	folderLeft.add(effTop, 'start').min(0).max(980);
	folderLeft.add(effTop, 'end').min(0).max(980);

	var folderLeft=gui.addFolder('left effect');
	folderLeft.add(effLeft, 'start').min(0).max(980);
	folderLeft.add(effLeft, 'end').min(0).max(980);

	var folderOpacity=gui.addFolder('opacity effect');
	folderOpacity.add(effOpacity, 'start').min(0).max(1);
	folderOpacity.add(effOpacity, 'end').min(0).max(1);

	var borderWidth=gui.addFolder('border width');
	borderWidth.add(effBorderWidth, 'start').min(0).max(100);
	borderWidth.add(effBorderWidth, 'end').min(0).max(100);


	//*/

	/*
	var eff=new EffectMoveUpAndFade($('#itemToEffect'));
	//*/
});
