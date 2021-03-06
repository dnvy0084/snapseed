
/*
	5x5 matrix class for colormatrix 

	m[0],	m[5],	m[10],	m[15],	m[20],
	m[1],	m[6],	m[11],	m[16],	m[21],
	m[2],	m[7],	m[12],	m[17],	m[22],
	m[3],	m[8],	m[13],	m[18],	m[23],
	m[4],	m[9],	m[14],	m[19],	m[24];

*/

this.math = this.math || {}; 
this.math.MAT5_TYPE = this.math.MAT5_TYPE || Float32Array;

(function(){
	
	"use strict";

	function Mat5( raw )
	{
		this.initAdjustmentProperties();

		//set identity matrix when raw undefined
		this.set( raw || 
			[
				1,0,0,0,0,
				0,1,0,0,0,
				0,0,1,0,0,
				0,0,0,1,0,
				0,0,0,0,1
			]
		);
	};

	Mat5.mix = function( a, b, t )
	{
		return a.add( b.sub( a ).scale( t ) );
	};

	var p = Mat5.prototype;

	/*
		image adjustment 용 속성 정의
	*/
	p.initAdjustmentProperties = function()
	{
		// 밝기
		Object.defineProperty( this, "brightness", {
			get: function()
			{
				return this.raw[20]; 
			},
			set: function( value )
			{
				var m = this.raw;

				m[20] = m[21] = m[22] = value;
			}
		});

		// 명암
		Object.defineProperty( this, "contrast", {
			get: function()
			{
				return this.raw[0];
			},
			set: function( value )
			{
				var m = this.raw;

				m[0] = m[6] = m[12] = value;
				m[20] = m[21] = m[22] = 128 * ( 1 - value );
			}
		});

		// grayscale
		Object.defineProperty( this, "grayscale", {
			get: function()
			{
				return this.raw[1] / 0.21;
			},

			set: function( t )
			{
				var _f = 1 - t,
					_r = t * 0.21,
					_g = t * 0.72,
					_b = t * 0.07;

				var m = this.raw;

				m[0] = _f + _r, m[5] = _g, 		m[10] = _b,
				m[1] = _r,		m[6] = _f + _g, m[11] = _b,
				m[2] = _r,		m[7] = _g,		m[12] = _f + _b;
			}
		});

		// 흑백
		Object.defineProperty( this, "binary", {
			get: function()
			{
				return this.raw[1] / 26.88;
			},

			set: function( t )
			{
				var binR = t * 26.88,//0.21 * 128,
					binG = t * 92.16,//0.72 * 128,
					binB = t * 8.96,//0.07 * 128,
					tras = -16255.104 * t,
					_f = 1 - t,
					m = this.raw;

				m[0] = _f+binR,	m[5] = binG,	m[10] = binB,	 m[15],	m[20] = tras,
				m[1] = binR,	m[6] = _f+binG,	m[11] = binB,	 m[16],	m[21] = tras,
				m[2] = binR,	m[7] = binG,	m[12] = _f+binB, m[17],	m[22] = tras;
				m[3],			m[8],			m[13],			 m[18],	m[23],
				m[4],			m[9],			m[14],			 m[19],	m[24];
			}
		});

		// 반전
		Object.defineProperty( this, "invert", {
			get: function()
			{
				var m = this.raw;

				return (m[0] - 1) / (-2);
			},

			set: function( t )
			{
				var m = this.raw,
					scale = 1 - 2 * t,
					translate = 255 * t;

				m[0] = scale,	m[5],			m[10],			m[15],		m[20] = translate,
				m[1] = 0,		m[6] = scale,	m[11],			m[16],		m[21] = translate,
				m[2] = 0,		m[7],			m[12] = scale,	m[17],		m[22] = translate,
				m[3] = 0,		m[8],			m[13],			m[18] = 1,	m[23],
				m[4] = 0,		m[9],			m[14],			m[19],		m[24] = 1;
			}
		})
	};

	p.set = function( raw )
	{
		this.raw = 	raw.constructor === Array ? 
					new math.MAT5_TYPE( raw ) : 
					raw;

		if( this.raw.length !== 25 )
			throw new Error( "invalid raw length" );
	};

	/*
		Matrix x vec3
	*/
	p.mul3 = function( src, dest )
	{
		var r = src[0], 
			g = src[1], 
			b = src[2], 
			m = this.raw;

		dest[0] = r*m[0] + g*m[5] + b*m[10] + 1*m[20],
		dest[1] = r*m[1] + g*m[6] + b*m[11] + 1*m[21],
		dest[2] = r*m[2] + g*m[7] + b*m[12] + 1*m[22]; 
	};

	/*
		Matrix x vec4
	*/
	p.mul4 = function( src, dest )
	{
		var r = src[0], 
			g = src[1], 
			b = src[2], 
			a = src[3], 
			m = this.raw;

		dest[0] = r*m[0] + g*m[5] + b*m[10] + a*m[15] + 1*m[20],
		dest[1] = r*m[1] + g*m[6] + b*m[11] + a*m[16] + 1*m[21],
		dest[2] = r*m[2] + g*m[7] + b*m[12] + a*m[17] + 1*m[22],
		dest[3] = r*m[3] + g*m[8] + b*m[13] + a*m[18] + 1*m[23];
	};

	/*
		M55 x M55
	*/
	p.append = function( mat )
	{
		var a = this.clone().raw,
			b = mat.raw;

		var a00 = a[0], a01 = a[5], a02 = a[10], a03 = a[15], a04 = a[20],
			a10 = a[1], a11 = a[6], a12 = a[11], a13 = a[16], a14 = a[21],
			a20 = a[2], a21 = a[7], a22 = a[12], a23 = a[17], a24 = a[22],
			a30 = a[3], a31 = a[8], a32 = a[13], a33 = a[18], a34 = a[23],
			a40 = a[4], a41 = a[9], a42 = a[14], a43 = a[19], a44 = a[24];

		var b0, b1, b2, b3, b4, r = new math.MAT5_TYPE( 25 );

		// B matrix의 열을 변수에 담아
		b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4];

		// A matrix의 행을 바꿔가며 곱. 
		r[0] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3 + a04 * b4;
		r[1] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
		r[2] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
		r[3] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
		r[4] = a40 * b0 + a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;
		
		b0 = b[5], b1 = b[6], b2 = b[7], b3 = b[8], b4 = b[9];

		r[5] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3 + a04 * b4;
		r[6] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
		r[7] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
		r[8] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
		r[9] = a40 * b0 + a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;
		
		b0 = b[10], b1 = b[11], b2 = b[12], b3 = b[13], b4 = b[14];

		r[10] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3 + a04 * b4;
		r[11] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
		r[12] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
		r[13] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
		r[14] = a40 * b0 + a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;
		
		b0 = b[15], b1 = b[16], b2 = b[17], b3 = b[18], b4 = b[19];

		r[15] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3 + a04 * b4;
		r[16] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
		r[17] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
		r[18] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
		r[19] = a40 * b0 + a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;
		
		b0 = b[20], b1 = b[21], b2 = b[22], b3 = b[23], b4 = b[24];

		r[20] = a00 * b0 + a01 * b1 + a02 * b2 + a03 * b3 + a04 * b4;
		r[21] = a10 * b0 + a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
		r[22] = a20 * b0 + a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
		r[23] = a30 * b0 + a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
		r[24] = a40 * b0 + a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;

		return new math.Mat5( r );
	};

	/*
		단위 행렬
	*/
	p.identity = function()
	{
		var m = this.raw;

		m[0 ]=1, m[1 ]=0, m[2 ]=0, m[3 ]=0, m[4 ]=0,
		m[5 ]=0, m[6 ]=1, m[7 ]=0, m[8 ]=0, m[9 ]=0,
		m[10]=0, m[11]=0, m[12]=1, m[13]=0, m[14]=0,
		m[15]=0, m[16]=0, m[17]=0, m[18]=1, m[19]=0,
		m[20]=0, m[21]=0, m[22]=0, m[23]=0, m[24]=1;

		return this;
	};

	/*
		M55 + M55
	*/
	p.add = function( mat )
	{
		var a = this.raw,
			b = mat.raw,
			r = new math.MAT5_TYPE( 25 );

		for( var i = 0, l = a.length; i < l; i++ )
			r[i] = a[i] + b[i];

		return new math.Mat5( r );
	};

	/*
		M55 - M55
	*/
	p.sub = function( mat )
	{
		var a = this.raw,
			b = mat.raw,
			r = new math.MAT5_TYPE( 25 );

		for( var i = 0, l = a.length; i < l; i++ )
			r[i] = a[i] - b[i];

		return new math.Mat5( r );
	};

	/*
		scalar x M55
	*/
	p.scale = function( scalar )
	{
		var a = this.raw,
			r = new math.MAT5_TYPE( 25 );

		for( var i = 0, l = a.length; i < l; i++ )
			r[i] = scalar * a[i];

		return new math.Mat5( r );
	};

	/*
		deepcopy M55
	*/
	p.clone = function()
	{
		return new math.Mat5( new math.MAT5_TYPE( this.raw ) );
	};

	/*
		return formatted string
	*/
	p.toString = function()
	{
		var m = this.raw;

		return 	"matrix 5x5\n" + 
				m[0] + ", " + m[5] + ", " + m[10] + ", " + m[15] + ", " + m[20] + "\n" +
				m[1] + ", " + m[6] + ", " + m[11] + ", " + m[16] + ", " + m[21] + "\n" +
				m[2] + ", " + m[7] + ", " + m[12] + ", " + m[17] + ", " + m[22] + "\n" +
				m[3] + ", " + m[8] + ", " + m[13] + ", " + m[18] + ", " + m[23] + "\n" +
				m[4] + ", " + m[9] + ", " + m[14] + ", " + m[19] + ", " + m[24];
	};

	math.Mat5 = Mat5;

})();

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

/*
	Matrix5 setting panel
*/

this.createjs = this.createjs || {};
	
(function (){

	"use strict";

	function Mat5Setting( mat5 )
	{
		this.initProperties();
		this.layout();
		this.matrix = mat5 || new math.Mat5();
	}

	var p = Mat5Setting.prototype;

	p.initProperties = function()
	{
		this.domElement = null;
		this.mat5 = null;

		Object.defineProperty( this, "matrix", {
			get: function()
			{
				return this.mat5;
			},
			set: function( value )
			{
				this.mat5 = value;

				var rows = this.domElement.children,
					row, input;

				for( var i = 0; i < rows.length; i++ )
				{
					row = rows[i].children;

					for( var j = 0; j < row.length; j++ )
					{
						input = row[j];
						input.index = j * 5 + i;
						input.value = this.mat5.raw[ input.index ];
					}
				}
			}
		});

		Object.defineProperties( this, {
			"x": {
				get: function()
				{
					return this.domElement.style.left.match( /[-]*\d+/g )[0];
				},
				set: function( value )
				{
					this.domElement.style.left = value + "px";		
				}
			},
			"y": {
				get: function()
				{
					return this.domElement.style.top.match( /[-]*\d+/g )[0];
				},
				set: function( value )
				{
					this.domElement.style.top = value + "px";
				}
			}
		})
	};

	p.layout = function() 
	{
		this.domElement = document.createElement( "DIV" );
		this.domElement.setAttribute( "class", "Mat5Setting-wrapper" );
		this.domElement.style.position = "absolute";

		this.domElement.innerHTML = "5x5 Matrix setting";

		var input, row; 

		for( var i = 0; i < 25; i++ )
		{
			if( i % 5 == 0 ) 
			{
				row = document.createElement( "DIV" );
				row.setAttribute( "class", "Mat5Setting-row" );

				this.domElement.appendChild( row );
			}

			input = document.createElement( "INPUT" );
			input.setAttribute( "class", "Mat5Setting-input" );
			input.setAttribute( "type", "text" );
			input.addEventListener( "keyup", this.onInputValue.bind( this ) );

			row.appendChild( input );
		}
	};

	p.onInputValue = function(e)
	{
		this.mat5.raw[ e.target.index ] = isNaN( e.target.value ) ? 0 : e.target.value;

		this.domElement.dispatchEvent( new Event( "INPUT_CHANGE", { bubbles: true, cancelable: false } ) );				
	};

	createjs.Mat5Setting = Mat5Setting;

})();