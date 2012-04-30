var Sphere = function(rec) {
	console.log("1234");
	this.rec = rec;
	this.vectorA = [ 0.0, 1.0, 0.0 ];
	this.vectorB = [ -1.0, -1.0, 1.0 ];
	this.vectorC = [ 1.0, -1.0, 1.0 ];
	this.vectorD = [ 1.0, -1.0, -1.0, ];
	this.vectorE = [ -1.0, -1.0, -1.0 ];
	
	this.vertexArray = [];

	this.vertexArrayItemSize = 3;
	this.vertexArrayNumItems = 0;
	this.colorArray = [];

	this.colorArrayItemSize = 4;
	this.colorArrayNumItems = 0;

	this.cubeVertices = [
	// Front face
	-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

	// Back face
	-1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

	];
	
	
	this.initBuffers();
};

Sphere.prototype.initBuffers = function(){

	normalize_vert(this.vectorA);
	normalize_vert(this.vectorB);
	normalize_vert(this.vectorC);
	normalize_vert(this.vectorD);
	normalize_vert(this.vectorE);
	
	this.tesselate(this.vectorA, this.vectorB, this.vectorC, this.rec);
	this.tesselate(this.vectorA, this.vectorC, this.vectorD, this.rec);
	this.tesselate(this.vectorA, this.vectorD, this.vectorE, this.rec);
	this.tesselate(this.vectorA, this.vectorE, this.vectorB, this.rec);
	
	this.tesselate(this.vectorB, this.vectorC, this.vectorD, this.rec);
	this.tesselate(this.vectorB, this.vectorD, this.vectorE, this.rec);

	
	this.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexArray), gl.STATIC_DRAW);
	
	this.colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorArray), gl.STATIC_DRAW);
	
	
	
};

Sphere.prototype.draw = function(radius) {
	
	mvPushMatrix();

	mat4.rotate(mvMatrix, degToRad(rPyramid), [ 0, 1, 0 ]);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			this.vertexArrayItemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			this.colorArrayItemSize, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, this.vertexArrayNumItems);
	
	mvPopMatrix();
	
	var j = 0;

	for (j; j < 24; j= j + 3) {
		mvPushMatrix();
		
		mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
		mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);
		mat4.translate(mvMatrix, [this.cubeVertices[j], this.cubeVertices[j+1], this.cubeVertices[j+2]]);
		
		mat4.scale(mvMatrix, [ 0.5, 0.5, 0.5 ]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
				this.vertexArrayItemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
				this.colorArrayItemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexArrayNumItems);

		mvPopMatrix();
	}
};

Sphere.prototype.tesselate = function( a, b, c, rec) {
	if (rec == 0) {

		// Load vertex data into a buffer
		radius= 1;
		this.vertexArray = this.vertexArray.concat([ a[0] * radius,
		          				a[1] * radius, a[2] * radius, b[0] * radius, b[1] * radius,
		        				b[2] * radius, c[0] * radius, c[1] * radius, c[2] * radius ]);
		
		this.vertexArrayNumItems += 3;
		
		this.colorArray = this.colorArray.concat([ a[0] * radius,
		             		          				a[1] * radius, a[2] * radius, 1, b[0] * radius, b[1] * radius,
		             		        				b[2] * radius, 1, c[0] * radius, c[1] * radius, c[2] * radius, 1 ]);
		             		
		this.colorArrayNumItems +=4;
	} else {
		var i = 0;

		var ab = [ 0.0, 0.0, 0.0 ];
		var ac = [ 0.0, 0.0, 0.0 ];
		var bc = [ 0.0, 0.0, 0.0 ];
		
		for (i; i < 3; i++) {
			ab[i] = (a[i] + b[i]) / 2.0;
			ac[i] = (a[i] + c[i]) / 2.0;
			bc[i] = (b[i] + c[i]) / 2.0;
		}
		
		normalize_vert(ab);
		normalize_vert(ac);
		normalize_vert(bc);
		
		this.tesselate(a, ab, ac, rec-1);
		this.tesselate(b, bc, ab, rec-1);
		this.tesselate(c, ac, bc, rec-1);
		this.tesselate(ab, bc, ac, rec-1);
	}
};

function normalize_vert(a) {
	var d = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
	a[0] /= d;
	a[1] /= d;
	a[2] /= d;
}
// http://musingsofninjarat.wordpress.com/spheres-through-triangle-tessellation/
