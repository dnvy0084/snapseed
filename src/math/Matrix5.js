
/*
	5x5 matrix class for colormatrix 
*/
this.math = this.math || {};
this.math.MAT5_TYPE = this.math.MAT5_TYPE || Float32Array;

(function(){
	
	"use strict";

	function Mat5( raw )
	{
		this._initProperties();

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

	p._initProperties = function()
	{
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

		b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4];

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

	p.add = function( mat )
	{
		var a = this.raw,
			b = mat.raw,
			r = new math.MAT5_TYPE( 25 );

		for( var i = 0, l = a.length; i < l; i++ )
			r[i] = a[i] + b[i];

		return new math.Mat5( r );
	};

	p.sub = function( mat )
	{
		var a = this.raw,
			b = mat.raw,
			r = new math.MAT5_TYPE( 25 );

		for( var i = 0, l = a.length; i < l; i++ )
			r[i] = a[i] - b[i];

		return new math.Mat5( r );
	};

	p.scale = function( scalar )
	{
		var a = this.raw,
			r = new math.MAT5_TYPE( 25 );

		for( var i = 0, l = a.length; i < l; i++ )
			r[i] = scalar * a[i];

		return new math.Mat5( r );
	};

	p.clone = function()
	{
		return new math.Mat5( new math.MAT5_TYPE( this.raw ) );
	};

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