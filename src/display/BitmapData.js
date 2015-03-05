
//name space
this.createjs = this.createjs || {};
 
(function (){
	
	"use strict";  



	/*
		url로 ImageData 객체 생성. 
		- img dom element생성 후 getImageData를 통해 ImageData 생성. 
		- 이때 getImageData를 위한 RenderingContext2D 객체는 offscreen canvas를 이용.

		getImageData( someURL, complete callback );
	*/
	BitmapData.getImageData = function( url, onComplete, maximumWidth, maximumHeight )
	{
		var img = document.createElement( "img" ),
			context = BitmapData.offscreenContext || document.createElement("canvas").getContext("2d");

		img.src = url;

		img.onload = function( e ) 
		{
			if( img.width > context.canvas.width )
				context.canvas.width = img.width;

			if( img.height > context.canvas.height )
				context.canvas.height = img.height;

			img.crossOrigin = "Anonymous";
			img.onload = null;

			var w = img.width, 
				h = img.height;

			if( typeof maximumWidth === "number" && typeof maximumHeight === "number")
			{
				var scale = Math.min( maximumWidth / w, maximumHeight / h );

				if( scale < 1 )
				{
					w = parseInt( w * scale + 0.0000001 );
					h = parseInt( h * scale + 0.0000001 );
				}
			}

			context.drawImage( img, 0, 0, w, h );
			onComplete( context.getImageData( 0, 0, w, h ) );
		};

		BitmapData.offscreenContext = context;
	};

	/*
		BitmapData 객체를 Base64 data uri로 변경하여 반환. 
		- getImageData와 같이 offscreen canvas를 이용. 
	*/
	BitmapData.toDataURL = function( bmpd )
	{
		var context = BitmapData.offscreenContext || document.createElement("canvas").getContext("2d"),
			canvas = context.canvas,
			imageData = bmpd.imageData;

		if( imageData.width != canvas.width )
			canvas.width = imageData.width;

		if( imageData.height != canvas.height )
			canvas.height = imageData.height;

		context.putImageData( imageData, 0, 0 );

		return context.canvas.toDataURL();
	};


	/*
		create BitmapData with ImageData Object
	*/
	function BitmapData( imageData )
	{
		this.DisplayObject_constructor(); 

		this.imageData = imageData;
		this.raw = new Uint8ClampedArray( imageData.data );

		this.initProperties();
	};


	var p = createjs.extend( BitmapData, createjs.DisplayObject );

	p.initProperties = function()
	{
		this.colorMatrixChanged = false;
		this._colorMatrices = [];

		this.border = false;
		this.borderWidth = 2;
		this.borderStyle = "#000";

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

	p.dispose = function()
	{
		this.imageData = null;
	};

	p.updateColorMatrices = function()
	{
		if( !this.colorMatrixChanged || this._colorMatrices.length == 0 ) return;

		var m = this._calcColorMatrices(), 
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

	p._calcColorMatrices = function()
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
		if( this.border ){
			context.save();
				context.fillStyle = this.borderStyle;
				context.beginPath();

				var x = -this.borderWidth,
					y = x,
					w = this.imageData.width + this.borderWidth * 2,
					h = this.imageData.height + this.borderWidth * 2;
				context.rect( parseInt(x), parseInt(y), w, h );
				context.fill();
			context.restore();	
		}

		this.updateColorMatrices();

		context.putImageData( this.imageData, parseInt(this.x), parseInt(this.y) );
	};

	p.getBounds = function()
	{
		if( typeof this.imageData !== "undefined" )
		{
			return this._rectangle.setValues(0, 0, this.imageData.width, this.imageData.height);
		}

		this._rectangle.setValues( 0, 0, 0, 0 );
		
		return this._rectangle;
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