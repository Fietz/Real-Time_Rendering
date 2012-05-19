jQuery(window).on('load',function(jQuery){
    //@Global
	window.canvas = document.getElementById('canvas');
	window.gl = tdl.webgl.setupWebGL(window.canvas);

    //@Private
    //jQuery
	var $canvas = $('#canvas'),
	    $content = $('#content'),
        $shaderSelect = $('#shaderSelect');

    //JS
    var shader = getShader(),
        modelToDraw = new tdl.models.Model(
            shader['Einfarbig'],
            tdl.primitives.createSphere(.35,9,2),
            {}
        ),
        uniformVars = {
            'const':{
                'projection':mat4.create(),
                'view':mat4.create(),
                'lightPosition':vec3.create([10,10,10]),
                'lightColor':vec3.create([1,1,1]),
                'camera':vec3.create()
            },
            'unique':{
                'model':mat4.create(),
                'color':vec3.create()
            }
        },
        degree = 0;
    //----------------------------------------------------------------------------------
    function initCanvas(){
        $canvas.attr('width',$content.width() *.5)
               .attr('height',$canvas.width());

    };
    function initUI(){
        $shaderSelect.attr('size',$(shader).size()+1);
        $.each(shader,function(name){
            $shaderSelect.append('<option>'+name+'</option>');
        })
        $shaderSelect.on('change',function(event){
            modelToDraw.setProgram(shader[$('option:selected',event.target).val()]);
        })
    }
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
        uniformVars.const.camera[1] = Math.cos(degree) ;
        uniformVars.const.camera[2] = Math.cos(degree) * 4.5;

        degree >= 360 ? degree = 0 : degree += .001;
        mat4.lookAt(
            uniformVars.const.camera,
            vec3.create([0,0,0]),
            vec3.create([0,1,0]),
            uniformVars.const.view);
        drawModels(modelToDraw);
    };

    function drawModels(model){
        model.drawPrep(uniformVars.const);
        for (var width = 0; width < 3 ; width += 1){
            for (var height = 0; height < 3; height += 1){
                for(var depth = 0; depth < 3; depth += 1){
                    mat4.translate(mat4.identity(uniformVars.unique.model), [width - 1,height - 1,depth -1]);
                    uniformVars.unique.color[0]= width / 2;
                    uniformVars.unique.color[1]= height / 2;
                    uniformVars.unique.color[2]= depth / 2;
                    model.draw(uniformVars.unique);
                }
            }
        }
    }

    //@Main
    (function(){
        initCanvas();
        initUI();
        render();
    })();
});