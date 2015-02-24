
//name space
this.createjs = this.createjs || {};

(function (){
	
	"use strict"; 

	/*
		create BitmapData with ImageData Object
	*/
	function BitmapData( imageData )
	{
		this.DisplayObject_constructor(); 

		this.imageData = imageData;
		this.raw = new Uint8ClampedArray( imageData.data );
		this.colorMatrixChanged = false;
		this._colorMatrices = [];

		this.initProperties();
	};



	var p = createjs.extend( BitmapData, createjs.DisplayObject );

	p.initProperties = function()
	{
		Object.defineProperty( this, "colorMatrices", {

			enumerable: true,
			
			get: function()
			{
				return this._colorMatrices;
			},
			
			set: function( value )
			{
				if( value.constructor !== Array )
					throw new Error( "invalid type: " + value.constructor );

				this.colorMatrixChanged = true;
				this._colorMatrices = value;
			}
		});
	};

	p.updateColorMatrices = function()
	{
		if( !this.colorMatrixChanged || this._colorMatrices.length == 0 ) return;

		var m = this.calcColorMatrices(), 
			srcBuf = this.raw,
			destBuf = this.imageData.data,
			src = new Uint8ClampedArray(3), 
			dest = new Uint8ClampedArray(3);

		for( var i = 0, l = srcBuf.length; i < l; i += 4 )
		{
			src[0] = srcBuf[i];
			src[1] = srcBuf[i+1];
			src[2] = srcBuf[i+2];
			//src[3] = srcBuf[i+3];

			m.mul3( src, dest );
			
			destBuf[i] = dest[0];
			destBuf[i+1] = dest[1];
			destBuf[i+2] = dest[2];
			//destBuf[i+3] = dest[3];
		}

		this.colorMatrixChanged = false;
	};

	p.calcColorMatrices = function()
	{
		var r = this._colorMatrices[0];

		for( var i = 1, l = this._colorMatrices.length; i < l; i++ )
		{
			r = r.append( this._colorMatrices[i] );
		}

		return r;
	};


	p.draw = function( context, ignoreCache )
	{
		this.updateColorMatrices();

		context.putImageData( this.imageData, 0, 0 );
	};

	p.getBounds = function()
	{
		var rect = this.DisplayObject_getBounds();

		if(rect) { return rect; }

		if( typeof this.imageData !== "undefined" )
		{
			return this._rectangle.setValues(0, 0, this.imageData.width, this.imageData.height);
		}

		return null;
	};

	p.getPixel = function( x, y )
	{
		var i = this._pixelIndex( x, y );

		if( i == -1 ) return 0;

		var colorBuf = this.imageData.data,
			r = colorBuf[i  ],
			g = colorBuf[i+1],
			b = colorBuf[i+2];

		return r << 16 | g << 8 | b;
	};

	p.getPixel32 = function( x, y )
	{
		var i = this._pixelIndex( x, y );

		if( i == -1 ) return 0;

		var colorBuf = this.imageData.data,
			r = colorBuf[i  ],
			g = colorBuf[i+1],
			b = colorBuf[i+2],
			a = colorBuf[i+3];

		return a << 24 | r << 16 | g << 8 | b;
	};

	p.setPixel = function( x, y, color )
	{
		var i = this._pixelIndex( x, y );

		if( i == -1 ) return;

		color = parseInt( color );

		var colorBuf = this.imageData.data;
		
		colorBuf[i] = color >> 16 & 0xff,
		colorBuf[i+1] = color >> 8 & 0xff,
		colorBuf[i+2] = color & 0xff;
	};

	p.setPixel32 = function( x, y, color )
	{
		var i = this._pixelIndex( x, y );

		if( i == -1 ) return;

		color = parseInt( color );

		var colorBuf = this.imageData.data;
		
		colorBuf[i  ] = color >> 16 & 0xff,
		colorBuf[i+1] = color >> 8 & 0xff,
		colorBuf[i+2] = color & 0xff,
		colorBuf[i+3] = color >> 24 & 0xff;
	};

	p._pixelIndex = function( x, y )
	{
		if( x < 0 || x > this.width ||
			y < 0 || y > this.height ) return -1;

		return 4 * y * this.imageData.width + x;
	}

	createjs.BitmapData = createjs.promote( BitmapData, "DisplayObject" );

})();