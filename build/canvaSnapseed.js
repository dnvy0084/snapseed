
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
		this._colorMatrixChanged = false;
		this._colorMatrix = new Float32Array([
			1, 0, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0,
			0, 0, 0, 0, 1
		]);

		this.initProperties();
	};



	var p = createjs.extend( BitmapData, createjs.DisplayObject );

	p.initProperties = function()
	{
		Object.defineProperty( this, "colorMatrix", {

			enumerable: false,
			
			get: function()
			{
				return this._colorMatrix;
			},
			
			set: function( value )
			{
				console.log( "set ", value );
			}
		});
	};


	p.multiply32 = function( color )
	{
		var r = color[0],
			g = color[1],
			b = color[2],
			a = color[3];
			w = color[4] || 1;

		var m = this._colorMatrix;

		color[0] = m[0] * r + m[1] * g + m[2] * b + m[3] * a + m[4] * w;
		color[1] = m[5] * r + m[6] * g + m[7] * b + m[8] * a + m[9] * w;
		color[2] = m[10] * r + m[11] * g + m[12] * b + m[13] * a + m[14] * w;
		color[3] = m[15] * r + m[16] * g + m[17] * b + m[18] * a + m[19] * w;
	};



	p.draw = function( context, ignoreCache )
	{
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
(function (){
	window.onload = function()
	{

	};
})();