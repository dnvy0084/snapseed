
/*
	Group
	RadioButton Group 처럼 여러개의 selected property가 있는 객체들을 관리해주는 util class
*/

this.createjs = this.createjs || {};

(function(){
	
	"use strict";

	function Group()
	{
		this.EventDispatcher_constructor(); 

		this._children = [];
		this._currObj = null;

		this.initProperties();
	}

	var p = createjs.extend( Group, createjs.EventDispatcher );

	p.initProperties = function()
	{
		Object.defineProperty( this, "numChildren", {
			get: function()
			{
				return this._children.length;
			}
		});

		Object.defineProperty( this, "currentSelected", {
			get: function()
			{
				return this._currObj;
			},

			set: function( o )
			{
				if( this._currObj == o ) return;

				if( this._currObj != null )
					this._currObj.selected = false;

				this._currObj = o;

				if( this._currObj != null )
					this._currObj.selected = true;
			}
		});
	};

	p.add = function( o )
	{
		if( !o.hasOwnProperty( "selected" ) )
			throw new Error( "selected 속성을 찾을 수 없습니다." );

		if( this.contains(o) ) return;

		this._children.push( o );
	};

	p.addAll = function( children )
	{
		for( var i = 0, l = children.length; i < l; i++ )
		{
			this.add( children[i] );
		}
	};

	p.remove = function( o )
	{
		var i = this._children.indexOf( o );

		if( i == -1 ) return null;

		return this._children.splice( i, 1 )[0];
	};

	p.removeAll = function()
	{
		var a = [];

		for( var i = 0, l = this._children.length; i < l; i++ )
		{
			a.push( this.remove( this._children[i] ) );
		}

		return a;
	};

	p.contains = function(o)
	{
		return this._children.indexOf( o ) != -1;
	};

	createjs.Group = createjs.promote( Group, "EventDispatcher" );

})();