jQuery(window).on('load',function(jQuery){
	window.canvas = document.getElementById("canvas");
	window.gl = tdl.webgl.setupWebGL(canvas);
	
	var $canvas = $('#canvas');
	
	var $content = $('#content');
	
	
	$canvas.attr('width',$content.width() - 50)
		   .attr('height',1000);
	
	
	function initGl(){
	    gl.viewport(0, 0, canvas.width, canvas.width * 0.6); 
	    gl.colorMask(true, true, true, true);
	    gl.depthMask(true);
	    gl.clearColor(0.8, 0.8, 0.8, 1);
	    gl.clearDepth(1);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

	    gl.enable(gl.CULL_FACE);
	    gl.enable(gl.DEPTH_TEST);
	}
	
	
	initGl();
	
});