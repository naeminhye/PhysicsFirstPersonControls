var WlakTrough=function(){THREE.EffectComposer.prototype.remove=function(ak){var aj=this.passes.indexOf(ak);if(aj>-1){this.passes.splice(aj,1)}};SEA3D.File.prototype.load=function(ak){var aj=73152932;var al=this,am=new XMLHttpRequest();am.open("GET",ak,true);am.responseType="arraybuffer";am.onprogress=function(an){if(an.lengthComputable){al.dispatchDownloadProgress(an.loaded,an.total)}else{al.dispatchDownloadProgress(an.loaded,aj)}};am.onreadystatechange=function(){if(am.readyState===2){}else{if(am.readyState===3){}else{if(am.readyState===4){if(am.status===200||am.status===0){al.read(this.response)}else{this.dispatchError(1001,"Couldn't load ["+ak+"] ["+am.status+"]")}}}}};am.send()};"use strict";Physijs.scripts.worker="./js/physijs_worker.js";Physijs.scripts.ammo="ammo.js";var x,r,I,D,aa,q,z,ag,w,O,A,Z,d,f,E,i,L,V,Y,e,S,ah=new THREE.Clock();var N,v;var G;var P,o;var W,j,T;var g,s,l;var h=new THREE.TextureLoader();var ai=this;var af,ad,ac,M;function k(){o=(Object.keys(ai.setup).length!=0)?ai.setup:{scene:"high",postprocessing:{enabled:true},paramsMov:{wire:true,frictionGround:1,frictionStairs:0.6,restitution:0,gravity:9.81,gravMul:100,velocityMul:400},paramsFog:{color:[0,0,0],density:0.001},paramsAO:{enabled:true,lumInfluence:0,aoClamp:1,renderMode:false,depthScale:1},paramsDOF:{enabled:true,focus:1,aperture:0.08,maxblur:0.1},paramsBLM:{enabled:true,strength:1.5},paramsDST:{dustPoints:2000,dustRange:1000,dustSize:1,dustSpeed:5},paramsLim:{exposure:1},paramsFr:{speed:1,magnitude:1.3,lacunarity:2,gain:0.5,scale:{x:50,y:50,z:50},position:{x:-160,y:2,z:180},noiseScale:{x:1,y:2,z:1}}}}function u(){D.onComplete=function(ak){x.traverse(function(al){if(al instanceof THREE.SEA3D.Mesh){al.castShadow=al.receiveShadow=al.rotationAutoUpdate=false;al.material.lightMapIntensity=o.paramsLim.exposure}});console.log("loading scene completed..");var aj=document.getElementsByClassName("intro");while(aj[0]){aj[0].parentNode.removeChild(aj[0])}H(0,0,0,-122,262,-189);Q();x.simulate();requestAnimationFrame(F)};D.onProgress=function(aj){if(aj.type.includes("download")){document.getElementById("progress").innerHTML="Downloading scene:<br>"+Math.floor(aj.progress*100)+" %"}else{if(aj.type.includes("progress")){if(!isNaN(aj.progress)){document.getElementById("progress").innerHTML="Preparing scene:<br>"+Math.floor(aj.progress*100)+" %"}}}};aa.onComplete=function(an){for(var al=0;al<aa.meshes.length;al++){var ak=(aa.meshes[al].name.toUpperCase().includes("MOVABLE"))?80:0;var am=(aa.meshes[al].name.toUpperCase().includes("STAIRS"))?o.paramsMov.frictionStairs:o.paramsMov.frictionGround;var ao=new Physijs.createMaterial(new THREE.MeshNormalMaterial({wireframe:true}),am,o.paramsMov.restitution);if(!o.paramsMov.wire){ao.visible=false}var aj=new Physijs.ConvexMesh(new THREE.Geometry().fromBufferGeometry(aa.meshes[al].geometry),ao,ak);aj.name=aj.geometry.name=aa.meshes[al].name;aj.name+="_CLDR";aj.material.visible=false;x.add(aj)}console.log("loading colliders completed..")};aa.onProgress=function(aj){document.getElementById("progress").textContent="Preparing for download... "};q.onComplete=function(ak){console.log("loading transparent completed..");for(var aj=0;aj<q.materials.length;aj++){q.materials[aj].transparent=true;q.materials[aj].depthWrite=false}}}this.init=function(){k();var aj=$("#webGL-container");I=new THREE.WebGLRenderer({antialias:true,alpha:true});I.setClearColor(0);I.setSize(window.innerWidth,window.innerHeight);I.shadowMap.enabled=true;I.shadowMapDebug=true;aj.append(I.domElement);V=new Stats();V.domElement.style.position="absolute";V.domElement.style.left="0px";V.domElement.style.top="0px";Y=new Stats();Y.domElement.style.position="absolute";Y.domElement.style.top="50px";Y.domElement.style.zIndex=100;x=new Physijs.Scene;console.log(o.paramsFog.color);var al=new THREE.Color(o.paramsFog.color[0]/255,o.paramsFog.color[1]/255,o.paramsFog.color[2]/255);console.log(al);x.fog=new THREE.FogExp2(al,o.paramsFog.density);x.setGravity({x:0,y:-1*o.paramsMov.gravity*o.paramsMov.gravMul,z:0});x.addEventListener("update",function(){x.simulate(undefined,2);z.updatePhys();Y.update()});r=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,10000);r.position.set(0,30,0);r.lookAt(x.position);Z=new Physijs.CapsuleMesh(m(10,40),Physijs.createMaterial(new THREE.MeshBasicMaterial({wireframe:true}),1,0),80);Z.material.visible=false;Z.position.y=40;Z.add(r);x.add(Z);Z.setAngularFactor(new THREE.Vector3(0,0,0));z=new THREE.PhysicsFirstPersonControls(Z);z.velocityMultyplier=o.paramsMov.velocityMul;z.startOn(aj,false);D=new THREE.SEA3D({container:x});q=new THREE.SEA3D({container:x,autoPlay:true});d=new THREE.Object3D();aa=new THREE.SEA3D();u();console.log("loading models coliders initiated...");aa.load("./models/Scene03Collider.sea");h.load("./models/textures/EnvironmentMap.jpg",K,ae,n);h.load("./models/textures/dust.png",C,ae,n);c();t();U();q.load("./models/Godrays.sea");var ak=(o.scene=="high")?"./models/modelH.sea":"./models/modelL.sea";D.load(ak);w=new THREE.AxisHelper(100);x.add(w)};function B(){var aj=ah.getElapsedTime()*o.paramsDST.dustSpeed/100;if(!N){return}N.rotation.y=aj}function C(aj){G=new THREE.PointsMaterial({size:1,map:aj,blending:THREE.AdditiveBlending,depthTest:true,transparent:true});N=new THREE.Points(X(),G);x.add(N)}function X(){var al=new THREE.Geometry();for(var aj=0;aj<o.paramsDST.dustPoints;aj++){var ak=new THREE.Vector3();ak.x=Math.random()*o.paramsDST.dustRange*(Math.random()<0.5?-1:1);ak.y=Math.random()*o.paramsDST.dustRange;ak.z=Math.random()*o.paramsDST.dustRange*(Math.random()<0.5?-1:1);al.vertices.push(ak)}return al}function ab(){N.geometry.dispose();x.remove(N);N=new THREE.Points(X(),G);x.add(N)}function K(ak){var aj=new THREE.Mesh(new THREE.SphereGeometry(4000,32,15),new THREE.MeshBasicMaterial({map:ak,side:THREE.BackSide,fog:false}));aj.rotation.y=Math.PI;x.add(aj)}function n(aj){console.log(aj)}function ae(aj){console.log((aj.loaded/aj.total*100)+"% loaded")}function U(){var am=new THREE.RenderPass(x,r);var aj=THREE.ShaderLib.depthRGBA;var ak=THREE.UniformsUtils.clone(aj.uniforms);g=new THREE.ShaderMaterial({fragmentShader:aj.fragmentShader,vertexShader:aj.vertexShader,uniforms:ak,blending:THREE.AdditiveBlending});var al={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};l=new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight,al);W=new THREE.ShaderPass(THREE.SSAOShader);W.uniforms.tDepth.value=o.paramsAO.depthRenderTarget;W.uniforms.size.value.set(window.innerWidth,window.innerHeight);W.uniforms.cameraNear.value=r.near;W.uniforms.cameraFar.value=r.far;W.uniforms.onlyAO.value=o.postprocessing.renderMode?1:0;W.uniforms.aoClamp.value=o.paramsAO.aoClamp;W.uniforms.lumInfluence.value=o.paramsAO.lumInfluence;W.material.name="ssaoMat";j=new THREE.BokehPass(x,r,{focus:o.paramsDOF.focus,aperture:o.paramsDOF.aperture,maxblur:o.paramsDOF.maxblur,width:e,height:S});j.renderToScreen=true;T=new THREE.BloomPass(o.paramsBLM.strength);s=new THREE.EffectComposer(I,l);s.addPass(am);if(o.paramsAO.enabled){s.addPass(W)}if(o.paramsBLM.enabled){s.addPass(T)}if(o.paramsDOF.enabled){s.addPass(j)}}function F(){V.update();requestAnimationFrame(F);THREE.SEA3D.AnimationHandler.update(ah.getDelta());if(o.postprocessing.enabled){I.autoClear=false;I.clear();x.overrideMaterial=g;I.render(x,r,l,false);x.overrideMaterial=null;s.render()}else{I.render(x,r)}v.update(ah.getElapsedTime()*o.paramsFr.speed);B()}function m(an,ak){var aj=new THREE.Geometry(),al=new THREE.CylinderGeometry(an,an,ak,10),ao=new THREE.SphereGeometry(an,10,10),ap=new THREE.SphereGeometry(an,10,10),am=new THREE.Matrix4();am.makeTranslation(0,-(ak-an),0);ap.applyMatrix(am);am.makeTranslation(0,(ak-an),0);ao.applyMatrix(am);aj.merge(ao);aj.merge(ap);aj.merge(al);return aj}function a(){P=new dat.GUI({height:5*32-1});var ao=P.addFolder("Fog");ao.addColor(o.paramsFog,"color").name("Color").onChange(function(){x.fog.color.r=o.paramsFog.color[0]/255;x.fog.color.g=o.paramsFog.color[1]/255;x.fog.color.b=o.paramsFog.color[2]/255});ao.add(o.paramsFog,"density").min(0).max(0.005).step(0.0001).name("Density").onFinishChange(function(){x.fog.density=o.paramsFog.density});var ap=P.addFolder("Ambient occlusion");ap.add(o.paramsAO,"aoClamp").min(0).max(1).step(0.1).name("Clamp").onFinishChange(function(){W.uniforms.aoClamp.value=o.paramsAO.aoClamp});ap.add(o.paramsAO,"lumInfluence").min(-10).max(10).step(0.1).name("Lum Influence").onFinishChange(function(){W.uniforms.lumInfluence.value=o.paramsAO.lumInfluence});ap.add(o.paramsAO,"enabled").name("Enabled").onFinishChange(function(){y(W)});ap.add(o.paramsAO,"renderMode").name("Render Mode").onFinishChange(function(){W.uniforms.onlyAO.value=o.paramsAO.renderMode?1:0});var aj=P.addFolder("Depth of field");aj.add(o.paramsDOF,"focus").min(0).max(1).step(0.1).name("Focus").onFinishChange(function(){j.uniforms.focus.value=o.paramsDOF.focus});aj.add(o.paramsDOF,"aperture").min(0).max(1).step(0.1).name("Aperture").onFinishChange(function(){j.uniforms.aperture.value=o.paramsDOF.aperture});aj.add(o.paramsDOF,"maxblur").min(0).max(1).step(0.1).name("Max blur").onFinishChange(function(){j.uniforms.maxblur.value=o.paramsDOF.maxblur});var an=P.addFolder("Bloom");an.add(o.paramsBLM,"strength").min(0).max(2).step(0.1).name("Strength").onFinishChange(function(){T.copyUniforms.opacity.value=o.paramsBLM.strength});an.add(o.paramsBLM,"enabled").name("Enabled").onFinishChange(function(){y(T)});var ak=P.addFolder("Dust");ak.add(o.paramsDST,"dustPoints").min(0).max(10000).step(1000).name("Dust Points").onFinishChange(function(){ab()});ak.add(o.paramsDST,"dustRange").min(0).max(10000).step(500).name("Range").onFinishChange(function(){ab()});ak.add(o.paramsDST,"dustSize").min(0).max(2).step(0.1).name("Size").onFinishChange(function(){N.material.size=o.paramsDST.dustSize});ak.add(o.paramsDST,"dustSpeed").min(0).max(20).step(1).name("Speed");var al=P.addFolder("Movement");al.add(o.paramsMov,"velocityMul").min(0).max(1000).step(100).name("Velocity X").onFinishChange(function(){z.velocityMultyplier=o.paramsMov.velocityMul});al.add(o.paramsMov,"frictionGround").min(0).max(6).step(0.1).name("Fricition ground").onFinishChange(R);al.add(o.paramsMov,"frictionStairs").min(0).max(6).step(0.1).name("Fricition stairs").onFinishChange(R);al.add(o.paramsMov,"restitution").min(0).max(1).step(0.1).name("Restitution").onFinishChange(R);al.add(o.paramsMov,"gravity").min(0).max(20).step(0.01).name("Gravity").onFinishChange(function(){x.setGravity({x:0,y:-1*o.paramsMov.gravity*o.paramsMov.gravMul,z:0})});al.add(o.paramsMov,"gravMul").min(0).max(200).step(1).name("Gravity X").onFinishChange(function(){x.setGravity({x:0,y:-1*o.paramsMov.gravity*o.paramsMov.gravMul,z:0})});var aq=P.addFolder("Light map");aq.add(o.paramsLim,"exposure").min(-10).max(10).step(0.1).name("Exposure").onFinishChange(function(){x.traverse(function(at){if(at instanceof THREE.SEA3D.Mesh){at.material.lightMapIntensity=o.paramsLim.exposure}})});var ar=P.addFolder("Fire");ar.add(o.paramsFr,"speed",0.1,10).step(0.1);ar.add(o.paramsFr,"magnitude",0,10).step(0.1).onChange(b);ar.add(o.paramsFr,"lacunarity",0,10).step(0.1).onChange(b);ar.add(o.paramsFr,"gain",0,5).step(0.1).onChange(b);ar.add(o.paramsFr.noiseScale,"x",0.5,5).step(0.1).name("Noise X").onChange(b);ar.add(o.paramsFr.noiseScale,"y",0.5,5).step(0.1).name("Noise Y").onChange(b);ar.add(o.paramsFr.noiseScale,"z",0.5,5).step(0.1).name("Noise Z").onChange(b);ar.add(o.paramsFr.scale,"x").name("Scale X").onChange(b);ar.add(o.paramsFr.scale,"y").name("Scale Y").onChange(b);ar.add(o.paramsFr.scale,"z").name("Scale Z").onChange(b);ar.add(o.paramsFr.position,"x").name("Position X").onChange(b);ar.add(o.paramsFr.position,"y").name("Position Y").onChange(b);ar.add(o.paramsFr.position,"z").name("Position Z").onChange(b);var am={save:function(){window.open("data:text/json;charset=utf-8,"+escape(JSON.stringify(o)))}};P.add(am,"save").name("Save to JSON");P.add(o.postprocessing,"enabled").name("Postprocessing")}function b(){v.material.uniforms.magnitude.value=o.paramsFr.magnitude;v.material.uniforms.lacunarity.value=o.paramsFr.lacunarity;v.material.uniforms.gain.value=o.paramsFr.gain;v.material.uniforms.noiseScale.value=new THREE.Vector4(o.paramsFr.noiseScale.x,o.paramsFr.noiseScale.y,o.paramsFr.noiseScale.z,0.3);v.scale.x=o.paramsFr.scale.x;v.scale.y=o.paramsFr.scale.y;v.scale.z=o.paramsFr.scale.z;v.position.x=o.paramsFr.position.x;v.position.y=o.paramsFr.position.y;v.position.z=o.paramsFr.position.z}function R(){x.traverse(function(aj){if(aj instanceof Physijs.ConvexMesh){if(!aj.name.toUpperCase().includes("_CLDR")){aj.material.dispose();x.remove(aj)}}});aa.onComplete()}function y(aj){for(p in s.passes){p.renderToScreen=false}if(aj instanceof THREE.BokehPass){(o.paramsDOF.enabled)?s.insertPass(j,3):s.remove(j)}if(aj instanceof THREE.BloomPass){(o.paramsBLM.enabled)?s.insertPass(T,1):s.remove(T)}if(aj instanceof THREE.ShaderPass){if(aj.material.name=="ssaoMat"){(o.paramsAO.enabled)?s.insertPass(W,2):s.remove(W)}}s.passes[s.passes.length-1].renderToScreen=true}function t(){h.load("./models/textures/lensflare/lensflare0.png",function(aj){af=aj});h.load("./models/textures/lensflare/lensflare2.png",function(aj){ad=aj});h.load("./models/textures/lensflare/lensflare3.png",function(aj){ac=aj})}function H(an,ar,ak,aq,ap,ao){var al=new THREE.PointLight(16777215,1.5,2000);al.color.setHSL(an,ar,ak);al.position.set(aq,ap,ao);x.add(al);var aj=new THREE.Color(16777215);aj.setHSL(an,ar,ak+0.5);var am=new THREE.LensFlare(af,700,0,THREE.AdditiveBlending,aj);am.add(ad,512,0,THREE.AdditiveBlending);am.add(ad,512,0,THREE.AdditiveBlending);am.add(ad,512,0,THREE.AdditiveBlending);am.add(ac,60,0.6,THREE.AdditiveBlending);am.add(ac,70,0.7,THREE.AdditiveBlending);am.add(ac,120,0.9,THREE.AdditiveBlending);am.add(ac,70,1,THREE.AdditiveBlending);am.customUpdateCallback=J;am.position.copy(al.position);x.add(am)}function J(ak){var an,am=ak.lensFlares.length;var al;var aj=-ak.positionScreen.x*2;var ao=-ak.positionScreen.y*2;for(an=0;an<am;an++){al=ak.lensFlares[an];al.x=ak.positionScreen.x+aj*al.distance;al.y=ak.positionScreen.y+ao*al.distance;al.rotation=0}ak.lensFlares[2].y+=0.025;ak.lensFlares[3].rotation=ak.positionScreen.x*0.5+THREE.Math.degToRad(45)}function c(){h.load("./models/textures/fire/firetex.png",function(aj){M=aj})}function Q(){v=new THREE.Fire(M);x.add(v);b()}$(window).resize(function(){e=window.innerWidth;S=window.innerHeight;r.aspect=e/S;r.updateProjectionMatrix();I.setSize(e,S)})};WlakTrough.prototype.setup={};