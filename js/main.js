
var walkTrough;

window.onload = function() {
	walkTrough = new WlakTrough();
	
	walkTrough.setup =   

		/// input here
		///

	{"postprocessing":{"enabled":true},"paramsMov":{"wire":true,"frictionGround":1,"frictionStairs":0.6,"restitution":0,"gravity":9.81,"gravMul":100,"velocityMul":100},"paramsFog":{"color":[160,118.01614763552479,58.03921568627452],"density":0.0008},"paramsAO":{"enabled":false,"lumInfluence":1,"aoClamp":0.3,"renderMode":false,"depthScale":1},"paramsDOF":{"enabled":true,"focus":1,"aperture":0.35,"maxblur":0.051},"paramsBLM":{"enabled":true,"strength":0.8},"paramsDST":{"dustPoints":7000,"dustRange":500,"dustSize":1.5,"dustSpeed":1},"paramsLim":{"exposure":2.1},"paramsFr":{"speed":2.8000000000000003,"magnitude":1.2000000000000002,"lacunarity":1.2000000000000002,"gain":1.5,"scale":{"x":58,"y":103,"z":63},"position":{"x":160,"y":37.4,"z":-180},"noiseScale":{"x":1,"y":2.6,"z":1}}};
			

    ///
	
}


function showBlock(id) {
	var element = document.getElementById(id);
	element.style.display = 'block';
}

function hideBlock(id) {
	var element = document.getElementById(id);
	element.style.display = 'none';
}

function start(option) {
	switch(option) {
		case 'high':
			
			walkTrough.setup.scene = "high";

			walkTrough.init();
			break;
		case 'medium':
			
			walkTrough.setup.scene = "high";
			walkTrough.setup.postprocessing.enabled = false;

			walkTrough.init();
			
			break;
		case 'low':
			
			walkTrough.setup.scene = "low";
			walkTrough.setup.postprocessing.enabled = false;
			
			walkTrough.init();
			break;
		default:
			console.log('No option selected!');
			
	}
	
		hideBlock('optionsScr');
		showBlock('loadIco');
		showBlock('info');
		showBlock('loadProg');
	
}

function goto(url) {

	if (!url) {
		
		window.location = './index.html';
	
	} else {
		
		window.location = url;
		
	}

}

