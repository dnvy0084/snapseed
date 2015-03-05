
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