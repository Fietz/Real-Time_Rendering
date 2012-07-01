jQuery(window).on('load',function(jQuery){
    //@Global
    window.canvas = document.getElementById('canvas');
    window.gl = tdl.webgl.setupWebGL(window.canvas);

    //@Private
    var shader = getShader();
    var speed = 0.0;
    var samples = 10;

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
            shader['PassOne'],
            tdl.primitives.createCylinder(.2,.5,20,20),
            textures
        )
        ,
        new tdl.models.Model(
            shader['PassOne'],
            tdl.primitives.createTruncatedCone(.5,0,.7,20,20),
            textures
        ),
        new tdl.models.Model(
                shader['PassOne'],
                tdl.primitives.createTruncatedCone(.5,0,.7,20,20),
                textures
            ),
        new tdl.models.Model(
                shader['PassOne'],
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
            'previousViewProjectionMat':new Float32Array(16),
            'samples':samples
        },
        'unique':{
            'model':mat4.create(),
            'color':vec3.create([1,0,0])
        }
    };

    //jQuery
    var $canvas = $('#canvas'),
        $content = $('#content'),
        $controlButton = $('#controlButton'),
        $shaderSelect = $('#shaderSelect'),
        $speed = $('#speed'),
        $speedOut = $('#speedOut');

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
    $canvas.attr('width',$content.width())
           .attr('height',$canvas.width());

    //Motion Blur Buffer
    var frameBuffer = {
        'buffer': new tdl.framebuffers.Float32Framebuffer($canvas.width(), $canvas.height(), true)
    };

    frameBuffer['plane'] = new tdl.models.Model(
        shader['MotionBlur'],
        {position: positions,indices:indices},
        frameBuffer.buffer.texture
    );

    var backBuffer = new tdl.framebuffers.BackBuffer(document.getElementById('canvas'));


    function initUI(){
        $controlButton.on('click',function(event){
           if(event.target.value === 'Stop'){
               event.target.value = 'Play';
           } else {
               event.target.value = 'Stop';
           }
        });

        $shaderSelect.attr('size',$(shader).size()+1);
        $.each(shader,function(name){
            $shaderSelect.append('<option>'+name+'</option>');
        })
        $shaderSelect.on('change',function(event){
            frameBuffer['plane'].setProgram(shader[$('option:selected',event.target).val()]);
        });

        $speed.on('change', function(event){
            var currentSpeed = parseFloat(event.target.value);
            speed = currentSpeed / 1000;
            $speedOut.text(currentSpeed);

        });

    }

    //----------------------------------------------------------------------------------
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
        var tMat4 = tdl.fast.matrix4;
        var viewProjection = new Float32Array(16);
        var tmpViewProjectMatViewProjectMat = new Float32Array(16);
        tdl.webgl.requestAnimationFrame(render, canvas);
        if($controlButton.val() === 'Stop'){



            tMat4.perspective(
                uniformVars.const.projection,
                tdl.math.degToRad(45),
                canvas.clientWidth / canvas.clientHeight,
                .1,
                50
                );

            tMat4.lookAt(
                uniformVars.const.view,
                uniformVars.const.camera,
                vec3.create([0,0,0]),
                vec3.create([0,1.0,0])
                );

            mat4.translate(uniformVars.const.view, [0, 0, cameraZPosition]);
            cameraZPosition > 50 ? cameraZPosition = 0 : cameraZPosition += speed ;
            cameraZPosition < 0 ? cameraZPosition = 50 : cameraZPosition += speed ;

            frameBuffer['buffer'].bind();
            gl.depthMask(true);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(false);

            tMat4.mul(tmpViewProjectMatViewProjectMat,uniformVars.const.view,uniformVars.const.projection);
            tMat4.inverse(uniformVars.const.inverseViewProjectionMat,tmpViewProjectMatViewProjectMat)
            // SkyBox -----------------------------------------------------------------------------------------
            tMat4.copy(viewProjection, uniformVars.const.view);
            tMat4.setTranslation(viewProjection, [0, 0, 0]);
            tMat4.mul(viewProjection, viewProjection, uniformVars.const.projection);
            tMat4.inverse(uniformVars.const.inverseViewProjectionMatSB, viewProjection);
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

            tMat4.mul(uniformVars.const.previousViewProjectionMat,uniformVars.const.view,uniformVars.const.projection);



        }
    };

    //@Main
    (function(){
        initUI();
        render();
    })();
});