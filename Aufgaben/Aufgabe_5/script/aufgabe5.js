jQuery(window).on('load',function(jQuery){
    //@Global
    window.canvas = document.getElementById('canvas');
    window.gl = tdl.webgl.setupWebGL(window.canvas);

    //@Private
    var shader = getShader();
    var textures = {

    };
    var degree = 0;
    tree = [
        new tdl.models.Model(
            shader['Phong'],
            tdl.primitives.createCylinder(.2,.5,20,20),
            textures
        )
        ,
    new tdl.models.Model(
        shader['Phong'],
        tdl.primitives.createTruncatedCone(.5,0,.7,20,20),
        textures
    ),
        new tdl.models.Model(
            shader['Phong'],
            tdl.primitives.createTruncatedCone(.5,0,.7,20,20),
            textures
        ),
    new tdl.models.Model(
            shader['Phong'],
            tdl.primitives.createTruncatedCone(.5,0,.7,20,20),
            textures
        )
    ]

    var uniformVars = {
        'const':{
            'projection':mat4.create(),
            'view':mat4.create(),
            'lightPosition': vec3.create([0,5,5]),
            'lightColor':vec3.create([1,1,1]),
            'camera':vec3.create([0,2,4.5])
        },
        'unique':{
            'model':mat4.create(),
            'color':vec3.create([1,0,0])
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

        mat4.lookAt(
            uniformVars.const.camera,
            vec3.create([0,0,0]),
            vec3.create([0,2,0]),
            uniformVars.const.view);
        
        speed = 0.1;
        
       mat4.translate(uniformVars.const.view, [0, 0, degree]);
       degree >= 50 ? degree = 0 : degree += speed ;
    
        
        
        $(tree).each(function(index,component){
            component.drawPrep(uniformVars.const);
            for (var depth = 0; depth < 20 ; depth += 1){
            	 for (var row = -3; row < 4 ; row += 2){
            		 mat4.identity(uniformVars.unique.model);
            		 mat4.translate(uniformVars.unique.model,[row,index/2,-depth*3])
            		 
            		 component.draw(uniformVars.unique);
            	 }
            }

        })

    };
    
    
    
    

    //@Main
    (function(){
        initCanvas();
        render();
    })();
});