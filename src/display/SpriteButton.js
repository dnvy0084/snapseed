
/*
	SpriteButton -> Sprite
	
*/

this.createjs = this.createjs || {};

(function(){
	
	"use strict";

	function SpriteButton( spriteSheet, frameOrAnimation, frameInfo ) 
	{
		this.Sprite_constructor( spriteSheet, frameOrAnimation );

		this.frameIndex = {};

		this.addEvents( frameInfo );
		this.initProperties(); 
	};

	var p = createjs.extend( SpriteButton, createjs.Sprite );

	p.initProperties = function()
	{
		this._selected = false;

		Object.defineProperty( this, "selected", {
			get: function()
			{
				return this._selected;
			},

			set: function( value )
			{
				if( value == this._selected ) return;

				this._selected = value;
				this.gotoAndStop( this.getFrameIndex( value ) );
			}
		});
	};

	p.getFrameIndex = function( value )
	{
		return value ? this.frameIndex.mousedown : this.frameIndex.mouseout || this.frameIndex.mouseup;
	};

	p.addEvents = function( frameInfo )
	{
		for( var s in frameInfo )
		{
			this.on( s, this.onInteractionListener.bind( this ) );

			this.frameIndex[s] = frameInfo[s];
		};

		var normalIndex = this.frameIndex.mouseout || this.frameIndex.mouseup;

		if( typeof normalIndex !== "undefined" )
			this.gotoAndStop( normalIndex );
	};

	p.onInteractionListener = function(e)
	{
		if( this.selected ) return;

		this.gotoAndStop( this.frameIndex[ e.type ] );
	};

	createjs.SpriteButton = createjs.promote( SpriteButton, "Sprite" );

})();