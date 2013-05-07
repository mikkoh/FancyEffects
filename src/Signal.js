define(['Class'], function(Class){

	var Signal = new Class({
		initialize: function()
		{
			this._signalID="signal"+Signal.nextSignalID;
			this._addOnceList={};
			this._listeners=[];

			Signal.nextSignalID++;

			//this ensures that an infinite recursion wont happen
			if(arguments.length==0)
			{
				this.onListenerAdded=new Signal(false);
				this.onListenerRemoved=new Signal(false);
			}
		},

		countListeners: 0,
		onListenerAdded: null,
		onListenerRemoved: null,
		_signalID: 0,
		_addOnceList: null,
		_listeners: null,
		_dispatchStopped: false,

		addOnce: function(listener)
		{
			this.add(listener);

			this._addOnceList[listener.listenerIDX[this._signalID]]=true;
		},
		add: function(listener)
		{
			//if addedID is true here we don't have any ids for this listener
			if(listener.listenerIDX==undefined)
			{
				listener.listenerID=Signal.nextListenerID++;
				listener.listenerIDX={};
			}

			//else we'll have to check if this id is in the list
			if(listener.listenerIDX[this._signalID]==undefined)
			{
				listener.listenerIDX[this._signalID]=this._listeners.length;
				this._listeners[this._listeners.length]=listener;

				this.countListeners++;

				if(this.onListenerAdded!=null)
					this.onListenerAdded.dispatch();
			}
		},
		remove: function(listener)
		{
			if(this._checkHasId(listener))
			{
				var delIDX=listener.listenerIDX[this._signalID];

				//delete the listener
				this._listeners.splice(delIDX, 1);

				//update the index for the listeners
				for(var i=delIDX;i<this._listeners.length;i++)	
				{
					this._listeners[i].listenerIDX[this._signalID]=i;
				}

				this.countListeners--;

				if(this.onListenerRemoved!=null)
					this.onListenerRemoved.dispatch();
			}
		},
		dispatch: function()
		{
			for(var i=0;!this._dispatchStopped && i<this._listeners.length;i++)
			{
				this._listeners[i].apply(null, arguments);

				if(this._addOnceList[i]!=undefined)
				{
					this.remove(this._listeners[i]);

					delete this._addOnceList[i];

					i--;
				}
			}

			this._dispatchStopped=false;
		},
		stopDispatch: function()
		{
			this._dispatchStopped=true;	
		},
		_checkHasId: function(listener)
		{
			return listener.listenerIDX!=undefined && listener.listenerIDX[this._signalID]!=undefined;	
		}
	});

	Signal.nextSignalID=0;
	Signal.nextListenerID=0;

	return Signal;

});