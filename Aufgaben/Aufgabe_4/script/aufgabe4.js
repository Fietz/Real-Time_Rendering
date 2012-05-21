jQuery(window).on('load',function(jQuery){
    //@Global
	window.canvas = document.getElementById('canvas');
	window.gl = tdl.webgl.setupWebGL(window.canvas);

    //@Private
    var shader = getShader();
    var textures = {
                    't1':tdl.textures.loadTexture('gfx/negx.png'),
                    't2':tdl.textures.loadTexture('gfx/negy.png'),
                    't3':tdl.textures.loadTexture('gfx/negz.png'),
                    't4':tdl.textures.loadTexture('gfx/sphere04.png'),
                    't5':tdl.textures.loadTexture('gfx/posy.png'),
                    't6':tdl.textures.loadTexture('gfx/posz.png'),
                    't7':tdl.textures.loadTexture('gfx/negx.png')
                    };
    var degree = 0;

    var sphere = new tdl.models.Model(
        shader['Einfarbig'],
        tdl.primitives.createSphere(1.5, 20,20),
        //tdl.primitives.createTorus(0.6,0.5,25,25),
        textures

    )

    var uniformVars = {
            'const':{
                'projection':mat4.create(),
                'view':mat4.create(),
                'lightPosition': vec3.create([0,0,10]),
                'lightColor':vec3.create([1,1,1]),
                'camera':vec3.create(3.5,0,3.5)
            },
            'unique':{
                'model':mat4.create(),
                'color':vec3.create([1,1,1])
            }
        };

    //jQuery
	var $canvas = $('#canvas'),
	    $content = $('#content');


    //----------------------------------------------------------------------------------
    function initCanvas(){
        $canvas.attr('width',$content.width() *.5)
               .attr('height',$canvas.width());
    };

	function initGl(){
	    gl.viewport(0, 0, canvas.width, canvas.width );
	    gl.colorMask(true, true, true, true);
	    gl.depthMask(true);
	    gl.clearColor(0.8, 0.8, 0.8, 1);
	    gl.clearDepth(1);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

	    gl.enable(gl.CULL_FACE);
	    gl.enable(gl.DEPTH_TEST);
	}

    function getShader(){
        var shader = {};
        $('script[id^="vs"]').each(function(index,element){
            var $element = $(element);
            id = $element.attr('id').replace("v","f");
            shader[$element.attr('name')] = tdl.programs.loadProgram($element.text(), $('#'+id).text())
        });
        return shader;
    }


    function render() {
        initGl();
        tdl.webgl.requestAnimationFrame(render, canvas);

        mat4.perspective(
            60,
            canvas.clientWidth / canvas.clientHeight,
            .1,
            10,
            uniformVars.const.projection);

        uniformVars.const.camera[0] = Math.sin(degree) * 4.5;
        uniformVars.const.camera[1] = Math.cos(degree);
        uniformVars.const.camera[2] = Math.cos(degree) * 4.5;

        degree >= 360 ? degree = 0 : degree += .001;
        mat4.lookAt(
            uniformVars.const.camera,
            vec3.create([0,0,0]),
            vec3.create([0,1,0]),
            uniformVars.const.view);

        sphere.drawPrep(uniformVars.const);
        mat4.identity(uniformVars.unique.model);
        mat4.rotateX(uniformVars.unique.model,Math.PI/4);
        sphere.draw(uniformVars.unique);
    };

    //@Main
    (function(){
        initCanvas();
        render();
    })();
});