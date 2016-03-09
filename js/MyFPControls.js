/*
 * @author Speculees
 * @ based on work of mrdoob and chandlerprall
 *	THANK YOU! :)
 */

THREE.PhysicsFirstPersonControls = function (object) {

	'use strict';
	this.object = object; //player capsule with camera

	this.camera = object.children[0];
	this.camera.rotation.set(0, 0, 0); // set initial camera rotation

	this.useableMeshes = [];

	this.raycasterFront = new THREE.Raycaster(
		this.camera.getWorldPosition()
		, this.camera.getWorldDirection()
	);

	this.raycasterBottom = new THREE.Raycaster(
		new THREE.Vector3()
		, new THREE.Vector3(0, -1, 0)
		, 0, 10
	);

	this.intersectionFront;
	this.intersectionBottom;

	this.enabled = true;

	this.removeStartObject; //seting this to true hides the startObject 
	this.startObject; //clicking on this object starts movement
	this.controlsEnabled = false; //are controls enabled. Clicking on canvas enables this field

	//EULER
	this.lat = 0; // latitude
	this.lon = 0; // longitude
	this.phi = 0; // angle latitude
	this.theta = 0; // angle longitude
	this.sensitivity = 0.06; // default sensitivity
	this.target = new THREE.Vector3(0, 0, 0);

	this.info = document.getElementById("info");

	/* 
	 *ADDITIONAL EVENT ATTRIBUTES 
	 *  distanceFront - returns the distance of frontal mesh
	 *  distanceBottom - returns the distance of bottom mesh
	 *  firstFrontMesh - returns the first mesh that front raycaster intersects 
	 *  firstBottomMesh - returns the first mesh that bottom raycaster intersects
	 */
	var eventAttrib = {}

	//Sounds				TODO
	/*Sound Enumerations*/
	this.soundsENUM = {
		FOOTSTEP_DEFAULT: 1
		, FOOTSTEP_WOOD: 2
		, FOOTSTEP_TILES: 3
		, FOOTSTEP_METAL: 4,

		STOP_DEFAULT: 5
		, STOP_WOOD: 6
		, STOP_TILES: 7
		, STOP_METAL: 8,

		JUMP_DEFAULT: 9,

		LAND_DEFAULT: 10
		, LAND_WOOD: 11
		, LAND_TILES: 12
		, LAND_METAL: 13,
		
		HITWALL: 14
		, NONE: 15
		, USE: 16
	};

	this.stepWalkDistance = 150;
	this.stepRunDistance = 270;
	this.playSounds = true;
	this.randomSounds = true;
	this.bufferLoader;
	this.audioSources = {
		walk_def: [
			"sounds/player/walk/151238__owlstorm__hard-female-footstep-2.wav", 
			"sounds/player/walk/151237__owlstorm__hard-female-footstep-3.wav"
		]
		, walk_wood: []
		, walk_tiles: []
		, walk_metal: [],

		stop_def: []
		, stop_wood: []
		, stop_tiles: []
		, stop_metal: [],

		jump: [
			"sounds/player/jump/slightscream-01.wav"
			,"sounds/player/jump/slightscream-02.wav"
			,"sounds/player/jump/slightscream-03.wav"
			,"sounds/player/jump/slightscream-04.wav"
			,"sounds/player/jump/slightscream-05.wav"
			,"sounds/player/jump/slightscream-06.wav"
			,"sounds/player/jump/slightscream-07.wav"
			
		],
		
		land_def : [
			"sounds/player/jump/jumpland.wav"	
		]
		, jump_wood: []
		, jump_tiles: []
		, jump_metal: []

		, use: ["sounds/buttonclick_online-audio-converterc.wav"],
		
		hit_wall_def: ["sounds/9099_1355147210.wav"]
	};

	var currentSoundType = this.soundsENUM.NONE;
	// create sound tracker
	var currentSound = [];
	for (var key in this.audioSources)
		currentSound.push(0);
	
	var currentStepDistance = 0;
	var bufferIndex = 0;


	this.jumpEnabled = true; //is Space enabled
	this.jumpImpulse = 0.5;
	var canJump = false, //if on ground, jump is possible 
		jumping = false; //jump key pressed

	var keys = {}; //keys pressed

	var PI_2 = Math.PI / 2;
	var PI_4 = PI_2 / 2;
	var yCoord = new THREE.Vector3(0, 1, 0);

	var stairs = false; //on stairs flag

	//SCOPE, CONTEXT, THAT
	var scope = this;

	this.maxWalkVelocity = 200; //Walking speed
	this.maxRunVelocity = 400; //Running speed
	this.runEnabled = true;

	var direction; //camera direction
	var prevPoint = new THREE.Vector3(); //player point in previous frame
	var timeLastRound = 0; //time of previous frame

	//KEYBOARD EVENTS
	this.actionKey = 'e'; //default action key

	var actionEvent = new CustomEvent('playerActionPerformed', {
		"detail": eventAttrib
	});
	var distanceEvent = new CustomEvent('distance', {
		"detail": eventAttrib
	});

	var onKeyDown = function (event) {

		if (event.which == 16) {

			keys["Shift"] = true;
			return;
		}

		keys[String.fromCharCode(event.which)] = true;
	};

	var onKeyUp = function (event) {
		if (String.fromCharCode(event.which) == scope.actionKey.toUpperCase()) {

			document.dispatchEvent(actionEvent); //on action key dispatch event

		}
		if (event.which == 69) {
			currentSoundType = scope.soundsENUM.USE;
			//console.log(event.which)
			
		}

		if (event.which == 16)
			delete keys["Shift"];
		else
			delete keys[String.fromCharCode(event.which)];

	};

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);


	// MOUSEMOVE CALLBACK FUNCTION
	var onMouseMove = function (event) {

		if (!scope.enabled) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		scope.lat -= movementY * scope.sensitivity; // look Up and down
		scope.lon += movementX * scope.sensitivity; // look left and right

		/*
		 *Disabling line below will continue to calc phi
		 *after the the player looks all the way up
		 */
		scope.lat = Math.max(-85, Math.min(85, scope.lat)); //Lock up and down

		/*
		 *Find angle phi & theta
		 *and convert to radians
		 */
		scope.phi = (90 - scope.lat) * Math.PI / 180;
		scope.theta = scope.lon * Math.PI / 180;

		var targetPosition = scope.target
			, position = scope.camera.position;

		// Euler angles
		targetPosition.x = position.x + 100 * Math.sin(scope.phi) * Math.cos(scope.theta);
		targetPosition.y = position.y + 100 * Math.cos(scope.phi);
		targetPosition.z = position.z + 100 * Math.sin(scope.phi) * Math.sin(scope.theta);

		scope.camera.lookAt(targetPosition); // camera look at target
	};



	this.object.addEventListener('collision', function (other_object, relative_velocity, relative_rotation, contact_normal) {
		
		console.log(contact_normal);
		if (contact_normal.y == -1) {
			canJump = true;
			currentSoundType = scope.soundsENUM.LAND_DEFAULT;
		}else
			currentSoundType = scope.soundsENUM.HITWALL;
		
		stairs = (other_object.geometry.name.toUpperCase().includes("STAIRS")) ? true : false;

	});

	/*
	 *LOCKING THE MOUSE IN BROWSER. 
	 *Without this the mouse would be present in game, and natural movement 
	 *would be impossible
	 */
	this.startOn = function (startObject, removeStartObject) {

		//console.log(scope.audioContext);

		this.startObject = startObject;
		this.removeStartObject = removeStartObject || false;

		var errorMessage = 'Your browser doesn\'t seem to support Pointer Lock API';
		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if (havePointerLock) {
			var element = document.body;
			/*Function that deals with pointerlock*/
			var pointerlockchange = function (event) {
				// if browser enters/leaves pointerlock mode 
				this.controlsEnabled = (document.pointerLockElement === element ||
					document.mozPointerLockElement === element ||
					document.webkitPointerLockElement === element) ? true : false;

				if (this.controlsEnabled) {
					document.addEventListener('mousemove', onMouseMove, false);
				} else {
					document.removeEventListener('mousemove', onMouseMove, false);
				}

			}.bind(this);
			/*Function that deals with pointerlock error*/
			var pointerlockerror = function (event) {
				alert(errorMessage);
			};
			// Hook pointer lock state change events
			document.addEventListener('pointerlockchange', pointerlockchange, false);
			document.addEventListener('mozpointerlockchange', pointerlockchange, false);
			document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
			document.addEventListener('pointerlockerror', pointerlockerror, false);
			document.addEventListener('mozpointerlockerror', pointerlockerror, false);
			document.addEventListener('webkitpointerlockerror', pointerlockerror, false);


			if (this.startObject != null) {
				if (!window.jQuery) {

					var starter = this.startObject;

				} else {

					var starter = (this.startObject instanceof jQuery) ? startObject.get(0) : startObject;

				}


				//on click trys to lock the pointer
				starter.addEventListener('click', function (event) {
					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

					// Deal with Firefox (if client is Firefox then go to fullscreen mode)
					if (/Firefox/i.test(navigator.userAgent)) {
						var fullscreenchange = function (event) {
							if (document.fullscreenElement === element ||
								document.mozFullscreenElement === element ||
								document.mozFullScreenElement === element) {
								document.removeEventListener('fullscreenchange', fullscreenchange);
								document.removeEventListener('mozfullscreenchange', fullscreenchange);
								element.requestPointerLock();
							}
						};

						document.addEventListener('fullscreenchange', fullscreenchange, false);
						document.addEventListener('mozfullscreenchange', fullscreenchange, false);

						element.requestFullscreen = element.requestFullscreen ||
							element.mozRequestFullscreen ||
							element.mozRequestFullScreen ||
							element.webkitRequestFullscreen;
						element.requestFullscreen();
					} else {
						element.requestPointerLock();
					}
				}, false);
			}
		} else {

			startObject.innerHTML = errorMessage;

		}

	}

	/*
	 *Updates the MOVMENT OF THE CAPSULE.
	 *This is done in physicis thread.
	 */
	this.updatePhys = function (delta) {
		if (this.controlsEnabled) {

			//          scope.raycasterBottom.ray.origin.copy( scope.object.position );
			//			scope.raycasterBottom.ray.origin.y -= 40; // This should not be hardcoded TODO fix this

			scope.raycasterFront.ray.origin = scope.camera.getWorldPosition();
			scope.raycasterFront.ray.direction = scope.camera.getWorldDirection();

			//          scope.intersectionBottom = scope.raycasterBottom.intersectObjects(scope.object.parent.children);
			scope.intersectionFront = scope.raycasterFront.intersectObjects(scope.useableMeshes);

			if (scope.intersectionFront.length) {

				eventAttrib.distanceFront = scope.intersectionFront[0].distance;
				eventAttrib.firstFrontMesh = scope.intersectionFront[0].object;

			} else {

				delete eventAttrib.distanceFront;
				delete eventAttrib.firstFrontMesh;

			}

			document.dispatchEvent(distanceEvent); //TODO fix constant updateing!

			// wait for player to land
			if (jumping) {
				if (canJump)
					jumping = false;
			} else
				move(delta); //init movement
		}

		switch (currentSoundType) {
		case scope.soundsENUM.FOOTSTEP_DEFAULT:
			//code block
				
				var source = scope.audioContext.createBufferSource();
				source.buffer = scope.audioSources.walk_def[currentSound[0]];
				source.connect(scope.audioContext.destination);
				source.start(0);
				
				
				if(++currentSound[0] == scope.audioSources.walk_def.length)
					currentSound[0] = 0;
			break;
		case scope.soundsENUM.FOOTSTEP_WOOD:
			//code block
			break;
		case scope.soundsENUM.FOOTSTEP_TILES:
			//code block
			break;
		case scope.soundsENUM.FOOTSTEP_METAL:
			//code block
			break;
		case scope.soundsENUM.STOP_WOOD:
			//code block
			break;
		case scope.soundsENUM.STOP_TILES:
			//code block
			break;
		case scope.soundsENUM.STOP_METAL:
			//code block
			break;
		case scope.soundsENUM.HITWALL:
			//code block
				var source = scope.audioContext.createBufferSource();
				source.buffer = scope.audioSources.hit_wall_def[currentSound[8]];
				source.connect(scope.audioContext.destination);
				source.start(0);
				
				
				if(++currentSound[8] == scope.audioSources.hit_wall_def.length)
					currentSound[8] = 0;
				
			break;
		case scope.soundsENUM.JUMP_DEFAULT:
			//code block
				
				var source = scope.audioContext.createBufferSource();
				source.buffer = scope.audioSources.jump[currentSound[9]];
				source.connect(scope.audioContext.destination);
				source.start(0);
				
				
				if(++currentSound[9] == scope.audioSources.jump.length)
					currentSound[9] = 0;
				
			break;
		case scope.soundsENUM.LAND_DEFAULT:
			//code block
				
				var source = scope.audioContext.createBufferSource();
				source.buffer = scope.audioSources.land_def[currentSound[10]];
				source.connect(scope.audioContext.destination);
				source.start(0);
				
				
				if(++currentSound[10] == scope.audioSources.land_def.length)
					currentSound[10] = 0;
				
			break;
		case scope.soundsENUM.USE:
		//code block

			var source = scope.audioContext.createBufferSource();
			source.buffer = scope.audioSources.use[currentSound[11]];
			source.connect(scope.audioContext.destination);
			source.start(0);


			if(++currentSound[11] == scope.audioSources.use.length)
				currentSound[11] = 0;

			break;
		}
		currentSoundType = scope.soundsENUM.NONE;

	}

	//Basic MOVE METHOD
	function move(delta) {
		if (!isEmpty(keys)) {
			//console.log(keys)
			direction = scope.camera.getWorldDirection();
			direction.normalize();
			direction.y = 0;

			if (keys.W) {
				if (keys.A) direction.applyAxisAngle(yCoord, PI_4);
				if (keys.D) direction.applyAxisAngle(yCoord, -PI_4);

			} else if (keys.S) {
				direction.applyAxisAngle(yCoord, Math.PI);

				if (keys.A) direction.applyAxisAngle(yCoord, -PI_4);
				if (keys.D) direction.applyAxisAngle(yCoord, PI_4);

			} else if (keys.A) {

				direction.applyAxisAngle(yCoord, PI_2);

			} else if (keys.D) {

				direction.applyAxisAngle(yCoord, -PI_2);

			} else if (Object.keys(keys)[0] == ' ') {

				direction.x = direction.z = 0;

			} else return;


			// Walkin or running
			var velocity, stepDistance;
			if (keys.Shift) {
				velocity = scope.maxRunVelocity
				stepDistance = scope.stepRunDistance;
			} else {

				velocity = scope.maxWalkVelocity
				stepDistance = scope.stepWalkDistance;
			}

			// Jumping
			if (Object.keys(keys).indexOf(' ') > -1) {

				if (scope.jumpEnabled) {
					
					currentSoundType = scope.soundsENUM.JUMP_DEFAULT;

					direction.y = direction.length() ? direction.length() * (1 + scope.jumpImpulse) : (1 + scope.jumpImpulse);
					direction.normalize();
					// TODO should maxRunVelocity be allowed in jump???
					scope.object.applyCentralImpulse(direction.multiplyScalar(scope.object.mass * scope.maxWalkVelocity));

					jumping = true;
					canJump = false;
					return;
				}
			}

			if (currentStepDistance >= stepDistance) {
				currentStepDistance = 0;
				currentSoundType = scope.soundsENUM.FOOTSTEP_DEFAULT;
			}

			//Get desired speed
			var deltaMovement = scope.object.position.distanceTo(prevPoint); //get distance between frames
			var timeThisRound = window.performance.now() || Date.now(); //get current time
			delta = timeThisRound - timeLastRound; //get time interval between frames in ms
			var magnitude = deltaMovement * delta; //get current velocity magnitude

			currentStepDistance += deltaMovement;
			//console.log(currentStepDistance);

			//Get desired impulse
			var velDelta = velocity - magnitude; // get desired speed
			var impulse = scope.object.mass * velDelta; // I = m*v

			//Apply desired impulse
			if (magnitude <= scope.maxRunVelocity) // Walk
			{
				scope.object.applyCentralImpulse(direction.multiplyScalar(impulse));

			}
			prevPoint = scope.object.position.clone();
			timeLastRound = timeThisRound;
		}
	}


	function isEmpty(ob) {
		// if cant make a single iteration, return false.
		for (var i in ob) {
			return false;
		}
		return true;
	}
};

THREE.PhysicsFirstPersonControls.prototype.setAudioContext = function (context) {
	this.audioContext = context;
	var scope = this;

	this.bufferLoader = new CustomBufferLoader(
		this.audioContext
		, this.audioSources
		, finishedLoading
	);

	this.bufferLoader.load();
	
	function finishedLoading(sources) {
		console.log("finished loading audio files for: ");
		//console.log(sources);
	}

	return this;
}

function CustomBufferLoader(context, sources, callback) {
	this.bufferList = [];
	this.context = context;
	this.sources = sources;
	this.onload = callback;
	this.loadCount = [];
	this.validParams = 0;
	this.paramCount = 0;
}

CustomBufferLoader.prototype.loadBuffer = function (url, i, j, param, length) {
	// Load buffer asynchronously
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var loader = this;

	request.onload = function () {
		// Asynchronously decode the audio file data in request.response
		loader.context.decodeAudioData(

			request.response,

			function (buffer) {

				if (!buffer) {
					alert('error decoding file data: ' + url);
					return;
				}
				
				
				//Uncoment this to see how loader works 
//				console.log(" currnet counter state: " + loader.loadCount[i] + 
//							";\n currnet list lenght of paths " + length + 
//							";\n current list lenght of loaded buffers " + loader.bufferList[i].length);
				
				loader.bufferList[i][j] = buffer;

				if (++loader.loadCount[i] == length) {
					loader.sources[param] = loader.bufferList[i];
					loader.bufferList[i] = [];
					loader.loadCount[0] = 0;
					if (++loader.paramCount == loader.validParams)
						loader.onload(loader.sources);
				}
			},

			function (error) {
				console.error('decodeAudioData error', error);
			}

		);

	}

	request.onerror = function () {
		alert('BufferLoader: XHR error');
	}

	request.send();
}

CustomBufferLoader.prototype.load = function () {
	for (var key in this.sources) {
		var urlList = this.sources[key];
		if (urlList.length) {
			this.validParams++;
			
			this.loadCount.push(0);
			this.bufferList.push([]);
			
			for (var i = 0; i < urlList.length; i++)
				/*
				1st: path to load;
				2nd: reserved counter index. This is needed boucuse the system is asynchronous and 
				you would end up writing on one counter for each AJAX call. This is really just the index 
				of first for loop;
				3rd: this is the index of the second for loop; Thus j = i;
				last argument is the length of the argument list;
				*/
				this.loadBuffer(urlList[i], (this.loadCount.length - 1), i, key, urlList.length);
		}
	}
}