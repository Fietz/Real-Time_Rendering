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
            //tdl.primitives.createSphere(0.4,15,15),
            //tdl.primitives.createTruncatedCone(0.5,0,1,12,12,true,true),
            tdl.primitives.createTorus(0.3,0.2,25,25),
            {}
        ),
        uniformVars = {
            'const':{
                'projection':mat4.create(),
                'view':mat4.create(),
                'lightPositions': convertLightsToArray(getLights()).positions,
                'lightColors':convertLightsToArray(getLights()).colors,
                'camera':vec3.create(0,2,0)
            },
            'unique':{
                'model':mat4.create(),
                'color':vec3.create()
            }
        },
        degree = 0;
        console.log(uniformVars.const.lightPositions,uniformVars.const.lightColors )
    //----------------------------------------------------------------------------------
    function initCanvas(){
        $canvas.attr('width',$content.width())
               .attr('height',$canvas.width());

    };
    function initUI(){
        $shaderSelect.attr('size',$(shader).size()+1);
        $.each(shader,function(name){
            $shaderSelect.append('<option>'+name+'</option>');
        })
        $shaderSelect.on('change',function(event){
            modelToDraw.setProgram(shader[$('option:selected',event.target).val()]);
        });

        $('div#lights input[type="number"]').on('input',function(event){

            var lights = convertLightsToArray(getLights());
            console.log(lights.positions)
            uniformVars.const.lightColors = lights.colors;
            uniformVars.const.lightPositions = lights.positions;
        });
        $('div#lights input').on('change',function(event){

            var lights = convertLightsToArray(getLights());
            uniformVars.const.lightColors = lights.colors;
            uniformVars.const.lightPositions = lights.positions;
        });


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

    function getLights(){
        var lights = {'positions':[],
                      'colors':[]};
        var $lightRows = $('#lights tr[id^="light"]');
        $lightRows.each(function(index, row){
            $inputs = $('input[type="number"]',row);

            lights.positions[index] = vec3.create([parseFloat($inputs[0].value),parseFloat($inputs[1].value),parseFloat($inputs[2].value)]);
            lights.colors[index] = vec4.create([parseFloat($inputs[3].value) > 1 ? parseFloat($inputs[3].value) / 255 : parseFloat($inputs[3].value),
                                                 parseFloat($inputs[4].value) > 1 ? parseFloat($inputs[4].value) / 255 : parseFloat($inputs[4].value),
                                                 parseFloat($inputs[5].value) > 1 ? parseFloat($inputs[5].value) / 255 : parseFloat($inputs[5].value),
                                                 $('input[type="checkbox"]',row).attr('checked') == 'checked' ? 1 : 0])
        })
        return lights;
    }

    function convertLightsToArray(that){
        var positionArray = [],
            colorArray = [];
        $.each(that.positions, function(index, value){
            $.each(value, function(index, value){
                positionArray.push(value);
            })
        });
        $.each(that.colors, function(index, value){
            $.each(value, function(index, value){
                colorArray.push(value);
            })
        });
        return {
            'positions':positionArray,
            'colors':colorArray
        };

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
                    mat4.identity(uniformVars.unique.model);
                    mat4.translate(uniformVars.unique.model, [width - 1,height - 1,depth -1]);
                    //PI/2 RAD ==> 90°
                    mat4.rotateX(uniformVars.unique.model,Math.PI/2);

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