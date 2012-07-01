jQuery(window).on('load',function(jQuery){
    //@Global
    window.canvas = document.getElementById('canvas');
    window.gl = tdl.webgl.setupWebGL(window.canvas);

    //@Private
    var shader = getShader();

    var skyBoxTextures = tdl.textures.loadTexture([
        'textures/rightdark.jpg',
        'textures/leftdark.jpg',
        'textures/topdark.jpg',
        'textures/botdark.jpg',
        'textures/frontdark.jpg',
        'textures/backdark.jpg'
    ]);

    var textures = {
        skyBox:skyBoxTextures
    };
    var cameraZPosition = 0;

    //Skybox taken from
    //http://code.google.com/p/webglsamples/source/browse/modern-skybox/modern-skybox.html?r=74ca30ba92bf717f44420afb9ca988dc836868e6
    var arrays = tdl.primitives.createPlane(2, 2, 1, 1);
    // Don't need normals or texcoords
    delete arrays['normal'];
    delete arrays['texCoord'];
    // reorient from xz plane to xy plane and move to back of clipspace in z.
    tdl.primitives.reorient(arrays,
        [1, 0, 0, 0,
         0, 0, 1, 0,
         0,-1, 0, 0,
         0, 0, 0.9999, 1]);
    var skyBox = new tdl.models.Model(shader['Skybox'], arrays, textures);

    var tree = [
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
    ];

    var uniformVars = {
        'const':{
            'projection':mat4.create(),
            'view':mat4.create(),
            'lightPosition': vec3.create([0,5,5]),
            'lightColor':vec3.create([1,1,1]),
            'camera':vec3.create([0,2.5,25]),
            'inverseViewProjectionMat':new Float32Array(16),
            'inverseViewProjectionMatSB':new Float32Array(16),
            'previousViewProjectionMat':new Float32Array(16)
        },
        'unique':{
            'model':mat4.create(),
            'color':vec3.create([1,0,0])
        }
    };

    //jQuery
    var $canvas = $('#canvas'),
        $content = $('#content');

    //create Plane to render the pass2 Texture
    var positions = new tdl.primitives.AttribBuffer(3,4);
    var indices = new tdl.primitives.AttribBuffer(3,4, 'Uint16Array');

    positions.push([-1,-1,0]);
    positions.push([1,-1,0]);
    positions.push([1,1,0]);
    positions.push([-1,1,0]);
    indices.push([0,1,2]);
    indices.push([2,3,0]);

    //initlize the Canvas Width and Height

    $canvas.attr('width',$content.width() *.5)
           .attr('height',$canvas.width());

    //Motion Blur Variables
    var frameBuffer = {
        'buffer': new tdl.framebuffers.Float32Framebuffer($canvas.width(), $canvas.height(), true)
    };
    console.log(frameBuffer)
    frameBuffer['plane'] = new tdl.models.Model(
        shader['MotionBlurGPUG'],
        {position: positions,indices:indices},
        frameBuffer.buffer.texture
    );
    console.log(frameBuffer)
    var backBuffer = new tdl.framebuffers.BackBuffer(document.getElementById('canvas'));


    //----------------------------------------------------------------------------------
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
        //initGl();
        tdl.webgl.requestAnimationFrame(render, canvas);

        tdl.fast.matrix4.perspective(
            uniformVars.const.projection,
            tdl.math.degToRad(30),
            canvas.clientWidth / canvas.clientHeight,
            .1,
            50
            );

        tdl.fast.matrix4.lookAt(
            uniformVars.const.view,
            uniformVars.const.camera,
            vec3.create([0,0,0]),
            vec3.create([0,1.0,0])
            );
        
        speed = 0.1;
        
       mat4.translate(uniformVars.const.view, [0, 0, cameraZPosition]);
       cameraZPosition > 50 ? cameraZPosition = 0 : cameraZPosition += speed ;
       cameraZPosition < 0 ? cameraZPosition = 50 : cameraZPosition += speed ;

        frameBuffer['buffer'].bind();
        gl.depthMask(true);
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(false);


        var viewProjection = new Float32Array(16);
        tdl.fast.matrix4.copy(viewProjection, uniformVars.const.view);
        tdl.fast.matrix4.setTranslation(viewProjection, [0, 0, 0]);
        tdl.fast.matrix4.mul(viewProjection, viewProjection, uniformVars.const.projection);
        tdl.fast.matrix4.inverse(uniformVars.const.inverseViewProjectionMatSB, viewProjection);

        var tmp = new Float32Array(16);
        tdl.fast.matrix4.mul(tmp,uniformVars.const.view,uniformVars.const.projection);
        tdl.fast.matrix4.inverse(uniformVars.const.inverseViewProjectionMat,tmp)


       // tmp = mat4.create();
       // mat4.multiply(uniformVars.const.view,uniformVars.const.projection,tmp);
       // mat4.inverse(tmp,uniformVars.const.inverseViewProjectionMat);

        skyBox.drawPrep(uniformVars.const);
        skyBox.draw();

        gl.depthMask(true);

        $(tree).each(function(index,component){
            component.drawPrep(uniformVars.const);
            for (var depth = 0; depth < 25 ; depth += 1){
            	 for (var row = -5; row <= 5 ; row += 2){
            		 mat4.identity(uniformVars.unique.model);
            		 mat4.translate(uniformVars.unique.model,[row,index/2,-depth*3])
            		 
            		 component.draw(uniformVars.unique);
            	 }
            }

        })

        backBuffer.bind();
        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);
        frameBuffer['plane'].drawPrep(uniformVars.const);
        frameBuffer['plane'].draw();

        tdl.fast.matrix4.mul(uniformVars.const.previousViewProjectionMat,uniformVars.const.view,uniformVars.const.projection);




    };

    //@Main
    (function(){
        //initGl();
        render();
    })();
});