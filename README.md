EffectsJS
=========

This is a non-destructive effects and animation library built ontop of jQuery.

Let's say we'd like to animate/effect a div with id "itemToEffect" by moving it's top from 0px to 100px.

Here's a simple example on how to set this up:

```javascript
var eff = new Effect($('#itemToEffect'));
eff.add(new EffectTop(0, 100));
```

By doing the above right away after this effect is applied top will be set to 0px. To put it to 100px we'd say.
```javascript
eff.percentage=1;
```

To 50px we'd say:
```javascript
eff.percentage=0.5;
```

This seems very simple but we can quickly create very reusable compound animations by adding more effects. For example:
```javascript
var eff = new Effect($('#itemToEffect'));
eff.add(new EffectWidth(500));
eff.add(new EffectTop(33));
eff.add(new EffectOpacity(0.5));
```

Notice this time we did not give width, top, or opacity two values but rather one. If you do this it will inherit css value
from #itemToEffect and use that as it's starting value.

If we did the following:
```javascript
var eff = new Effect($('#itemToEffect'));
eff.add(new EffectTop());
```

Basically pass in no values to the constructor of the top effect then the start and end values will both be inherited 
from #itemToEffect.

You might think that's pretty lame. But you can change the start and end values after being created. 

This is how you'd do that.
```javascript
var eff = new Effect($('#itemToEffect'));
var top = new EffectTop();
eff.add(top);
top.start=10;
```

Now top would start at 10px and go to the inherited or original position of #itemToEffect.
