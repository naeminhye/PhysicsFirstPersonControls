    'use strict';

    Physijs.scripts.worker =   './js/physijs_worker.js';
	Physijs.scripts.ammo =     'ammo.js';

    var initScene, render, renderer, scene, camera, cubeCamera, box, directionalLight,
        player, controls, guiparams, container, door, mat1;
    
    var wireMat = new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true });;
    
    var pbox, dbox;

    var doorParams = {};

    var loader;
    
    //Create default gui params object
    //When changing here one must also change the params loaded in main.js
    //This is on a fallback
    function createParams() {
        // Load setup variable from json or make default values
        guiparams = {
		  scene: "high",
          postprocessing : { enabled : true },  
          paramsMov : {
                wire: true,
                frictionGround: 1,
                frictionStairs: 0.6,
                restitution: 0,
                gravity: 9.81,
                gravMul: 100,
                velocityMul: 400
            },
            paramsFog : {
                color: [0,0,0],
                density: 0.001
            },
            paramsAO : {
                enabled: true,
                lumInfluence: 0,
                aoClamp: 1,
                renderMode: false,
                depthScale : 1
            },
            paramsDOF : {
                enabled: true,
                focus: 		1.0,
                aperture:	0.08,
                maxblur:	0.1
            },
            paramsBLM : {
                enabled: true,
                strength : 1.5
            },
            paramsDST : {
                dustPoints: 2000,
                dustRange:  1000,
                dustSize:   1,
                dustSpeed:  5
            },
            paramsLim : {
                exposure : 1
            },
			paramsFr : {
                speed       : 1.0,
                magnitude   : 1.3,
                lacunarity  : 2.0,
                gain        : 0.5,
                scale : { x:50, y: 50, z : 50 },
                position : { x:-160, y: 2.0, z : 180 },
                noiseScale : { x:1.0, y: 2.0, z : 1.0 }
			}
        };
    }

    initScene = function() {
        // Fix up prefixing
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		var audioContext = new AudioContext();
		
		renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        container = document.getElementById( 'webGL' )
        container.appendChild( renderer.domElement );

        createParams();
                
        scene = new Physijs.Scene;
        scene.setGravity(new THREE.Vector3(0,-300 * 3,0));
        
		scene.fog = new THREE.Fog( 0xffffff, 5400, 5400);
		scene.fog.color.setHSL( 0.51, 0.6, 0.6 );
        
		// Physics worker thread
        // This updates on different clock
        
		scene.addEventListener(
			'update',
			function() {
                var dt = clock.getDelta();
                if (dt > 0.05) dt = 0.05;
				scene.simulate(undefined, 2);
				//scene.simulate(null,1);
				controls.updatePhys(dt);
			}
		);

        camera =  new THREE.PerspectiveCamera(45, 
                                              window.innerWidth/window.innerHeight, 
                                              .1, 
                                              10000);
        camera.position.set(0, 67, 0);
        camera.lookAt(scene.position);
        
        /*load textures and materilas*/
//        directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 0.1 );
//        directionalLight.position.set( -1000, 700, -1000 );
//        directionalLight.castShadow = true;
//        scene.add( directionalLight );
        
		
		var light = new THREE.AmbientLight( 0x404040 ); // soft white light
		scene.add( light );

		
        /*load player colider*/
        player = new Physijs.CapsuleMesh(
            createCapsule(10, 40),
		    Physijs.createMaterial( 
                new THREE.MeshBasicMaterial({wireframe: true}),
                2, // friction
                0 // restitution
            )
		);
        
		        
        player.material.visible = false;
        player.position.y = 50;
        player.position.x = 150;
        player.add(camera);
        scene.add(player);
		player.setAngularFactor(new THREE.Vector3(0,0,0));
		
         /*add controls*/
        controls = new THREE.PhysicsFirstPersonControls(player);
        controls.setAudioContext(audioContext).startOn(container, false);
		
		
		
		// CUBE CAMERA

		cubeCamera = new THREE.CubeCamera( 1, 100000, 512 );
//		cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

		scene.add( cubeCamera );
//
//		cubeCamera.renderTarget.wrapT =
//		cubeCamera.renderTarget.wrapS = THREE.RepeatWraping
		
		cubeCamera.renderTarget.texture.format = THREE.RGBFormat;
        //cubeCamera.renderTarget.stencilBuffer =  false
		
		// MATERIALS
		
		var repeat = 10;
		
		var texture = new THREE.TextureLoader().load( "models/pebbles01.jpg" );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( repeat, repeat );
		
		var texture1 = new THREE.TextureLoader().load( "models/pebbles02.jpg" );
		texture1.wrapS = THREE.RepeatWrapping;
		texture1.wrapT = THREE.RepeatWrapping;
		texture1.repeat.set( repeat, repeat );
		
		var texture2 = new THREE.TextureLoader().load( "models/pebbles03.jpg" );
		texture2.wrapS = THREE.RepeatWrapping;
		texture2.wrapT = THREE.RepeatWrapping;
		texture2.repeat.set( repeat, repeat );
		
		
		mat1 = new THREE.MeshPhongMaterial( {  
			color: 0x00ffff,
			specular:0xff0000,
			shininess: 1,
			//normalMap: texture1,
			bumpMap: texture1,
			//specularMap : texture2,
			depthWrite: false,
			envMap: cubeCamera.renderTarget,
			combine: THREE.MixOperation,
			reflectivity: 1,
			metal: true
		} );
//        mat1.envMap.texture.magFilter = THREE.NearestFilter;
//		mat1.envMap.texture.minFilter = THREE.NearestFilter;

		console.log(mat1)
	
        // Box
        box = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 1500, 1, 1500 ),
            Physijs.createMaterial( mat1, 4, 0.5 ),
            0
        );
        
		
		
        box.geometry.name = "foo";
        
        box.position.y = -10;
        scene.add( box );
        
        loader = new THREE.SEA3D( {

            //autoPlay : true, // Auto play animations
            //container : scene // Container to add models

        } );

        loader.onComplete = function( e ) {
            console.log(loader.meshes[0]);
            doorParams.anim = loader.meshes[0];
            
            
            //doorParams.anim.geometry.center();
            
            
            var box = new THREE.BoxGeometry(
                doorParams.anim.geometry.boundingBox.max.x - doorParams.anim.geometry.boundingBox.min.x,
                doorParams.anim.geometry.boundingBox.max.y - doorParams.anim.geometry.boundingBox.min.y,
                doorParams.anim.geometry.boundingBox.max.z - doorParams.anim.geometry.boundingBox.min.z
            
            );
            
            //console.log(doorParams.anim);
            
            
            //doorParams.block = new Physijs.BoxMesh(new THREE.BoxGeometry(20, 100 ,50), wireMat, 10);
            doorParams.block = new Physijs.BoxMesh(box, wireMat, 0);
            
            
            // finetunung
            doorParams.block.position.x = doorParams.anim.position.x + (doorParams.anim.position.x * .025);
            doorParams.block.position.y = doorParams.anim.position.y + (doorParams.anim.position.x * .45);
            doorParams.block.position.z = doorParams.anim.position.z + (doorParams.anim.position.x * .2);
            
            door = new Door(doorParams)
                .setkey(controls.actionKey);
            controls.useableMeshes.push(doorParams.anim);
            //console.log(door);
            
        };

        loader.load( './models/door.sea' );
        
        //door.moveTo( 0, 50, 110);
        
        ///HELPERS
		console.log(cubeCamera.updateCubeMap)
		
        scene.simulate(); // run physics
        requestAnimationFrame( render );
    };

    var clock = new THREE.Clock();

    render = function() {
        
		requestAnimationFrame( render );

        var delta = clock.getDelta();

		
//		mat1.normalScale = {
//			x: Math.sin(clock.getElapsedTime() / Math.PI * 10),
//			y: Math.sin(clock.getElapsedTime() / Math.PI * 2)
//		
//		}
		
        // Update SEA3D Animations
        THREE.SEA3D.AnimationHandler.update( delta );

        // Update Three.JS Animations
        THREE.AnimationHandler.update( delta );
		
		cubeCamera.position.copy( {x:player.position.x, y:-67 - player.position.y  , z:player.position.z} );

		// render scene

		cubeCamera.updateCubeMap( renderer, scene );
		renderer.render( scene, camera); // render the scene
        
		

    };

    window.onload = initScene;


    function createCapsule(width, height) {

        var merged = new THREE.Geometry(),
            cyl = new THREE.CylinderGeometry(width, width, height, 10),
            top = new THREE.SphereGeometry(width, 10, 10),
            bot = new THREE.SphereGeometry(width, 10, 10),
            matrix = new THREE.Matrix4();

        matrix.makeTranslation(0, -(height - width), 0);
        bot.applyMatrix(matrix);
        matrix.makeTranslation(0, (height - width), 0);
        top.applyMatrix(matrix);
        // merge to create a capsule
        merged.merge(top);
        merged.merge(bot);
        merged.merge(cyl);

        return merged;
    }

    //{field: THREE.mesh, knob: THREE.mesh, anim: sea3d.mesh} 
    var Door = function(params) {
        this.params = params;
        this.distance = 130;
        this.closed = true;
        this.closeEnough;
        this.key = ""
        
        scene.add(params.anim);
        scene.add(params.block);
        
        this.setSplash();
        
        var context = this;
        
        var triger = function() {
          
            if (!context.closeEnough) return;

            if (context.closed) {
                
                params.anim.animation.play("otvaranje", .1);
                scene.remove(params.block);

            } else {
                
                params.anim.animation.play("zatvaranje", .1);
                scene.add(params.block);

            }

            context.closed = !context.closed;
        
        }
        
        var findDistance = function(e) {
            //console.log(e.detail.firstFrontMesh);
            
            if (e.detail.firstFrontMesh === context.params.anim &&
                e.detail.distanceFront <= context.distance) {

                context.closeEnough = true;
                context.splash.style.display = "block";

            } else {

                context.closeEnough = false;
                context.splash.style.display = "none";

            }

        }
    
        document.addEventListener("playerActionPerformed", triger, false);
        document.addEventListener("distance", findDistance, false);
        
    }
    
    Door.prototype.setSplash = function() {
        this.splash = document.createElement("div");
        this.splash.setAttribute("class", "doorSplash");
        this.splash.textContent = ("Press " + this.key.toUpperCase());
        this.splash.style.display = "none";
        this.splash.style.position = "absolute";
        this.splash.style.top = 
            this.splash.style.bottom =
            this.splash.style.left = 
            this.splash.style.right = 0;
        this.splash.style.color = "orange";
        container.appendChild(this.splash);
    }
    
    Door.prototype.moveTo = function( x, y, z ){
    
    }
    
    Door.prototype.setkey = function( key ){
        this.key = key;     //set key
        this.setSplash();   //refresh splash
        return this;
    }