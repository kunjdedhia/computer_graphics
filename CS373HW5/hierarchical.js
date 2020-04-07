/* CMPSCI 373 Homework 5: Hierarchical Scene */

const width = 800, height = 600;
const fov = 60;
const cameraz = 6;
const aspect = width/height;
const smoothShading = true;
let   animation_speed = 1.0;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(fov, aspect, 1, 1000);
camera.position.set(12, 1, cameraz);

let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.setClearColor(0x202020);
window.onload = function(e) {
	document.getElementById('window').appendChild(renderer.domElement);
}
let orbit = new THREE.OrbitControls(camera, renderer.domElement);	// create mouse control

let light0 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light0.position.set(camera.position.x, camera.position.y, camera.position.z);	// this light is at the camera
scene.add(light0);

let light1 = new THREE.DirectionalLight(0x800D0D, 1.0); // red light
light1.position.set(-1, 1, 0);
scene.add(light1);

let light2 = new THREE.DirectionalLight(0x0D0D80, 1.0); // blue light
light2.position.set(1, 1, 0);
scene.add(light2);

let amblight = new THREE.AmbientLight(0x202020);	// ambient light
scene.add(amblight);

let material = new THREE.MeshPhongMaterial({color:0x706565, specular:0x101010, shininess: 50, side:THREE.FrontSide});
let models = []; // array that stores all models
let numModelsLoaded = 0;
let numModelsExpected = 0;

// load OBJ models or create shapes
// ===YOUR CODE STARTS HERE===
let g1 = new THREE.Group();
let g2 = new THREE.Group();
let g3 = new THREE.Group();
let g4 = new THREE.Group();
let g5 = new THREE.Group();

let c1 = new THREE.SphereGeometry(1.2, 32, 32);
models['c1'] = new THREE.Mesh(c1, material);

let b2 = new THREE.BoxGeometry(0.5, 2.5, 0.5, 7.5, 12.5, 7.5);
models['b2'] = new THREE.Mesh(b2, material);
let rot_fw_b2 = true;

let b3 = new THREE.BoxGeometry(0.5, 2.5, 0.5, 7.5, 12.5, 7.5);
models['b3'] = new THREE.Mesh(b3, material);

let c2 = new THREE.SphereGeometry(1.2, 32, 32);
models['c2'] = new THREE.Mesh(c2, material);

let c3 = new THREE.SphereGeometry(1.2, 32, 32);
models['c3'] = new THREE.Mesh(c3, material);

let c4 = new THREE.SphereGeometry(1.2, 32, 32);
models['c4'] = new THREE.Mesh(c4, material);
let rot_fw_c4 = true;

let b4 = new THREE.BoxGeometry(0.5, 0.5, 0.8, 7.5, 12.5, 7.5);
models['b4'] = new THREE.Mesh(b4, material);

let b5 = new THREE.BoxGeometry(0.5, 0.5, 0.8, 7.5, 12.5, 7.5);
models['b5'] = new THREE.Mesh(b5, material);

let b6 = new THREE.BoxGeometry(0.5, 0.5, 0.8, 7.5, 12.5, 7.5);
models['b6'] = new THREE.Mesh(b6, material);

let b7 = new THREE.BoxGeometry(0.5, 0.5, 0.8, 7.5, 12.5, 7.5);
models['b7'] = new THREE.Mesh(b7, material);
// ---YOUR CODE ENDS HERE---

// 'label' is a unique name for the model for accessing it later
function loadOBJ(fileName, material, label) {
	numModelsExpected++;
	loadOBJAsMesh(fileName, function(mesh) { // callback function for non-blocking load
		mesh.computeFaceNormals();
		if(smoothShading) mesh.computeVertexNormals();
		models[label] = new THREE.Mesh(mesh, material);
		numModelsLoaded++;
	}, function() {}, function() {});
}

let initialized = false;
function animate() {
	requestAnimationFrame( animate );
	if(numModelsLoaded == numModelsExpected) {	// all models have been loaded
		if(!initialized) {
			initialized = true;
			// construct the scene
// ===YOUR CODE STARTS HERE===
			scene.add(models['c1']);
			models['b4'].position.x = -0.8;
			models['b4'].position.y = -0.9;
			models['b4'].rotation.setFromVector3(new THREE.Vector3( 0, 0, -Math.PI / 7));
			scene.add(models['b4']);
			models['b5'].position.x = 0.8;
			models['b5'].position.y = -0.9;
			models['b5'].rotation.setFromVector3(new THREE.Vector3( 0, 0, Math.PI / 7));
			scene.add(models['b5']);
			scene.add(g1);
			models['b2'].position.x = -1.6
			models['b2'].position.y = 1.8
			models['b2'].rotation.setFromVector3(new THREE.Vector3( 0, 0, Math.PI / 4));
			g1.add(models['b2']);

			models['c1'].add(g2);
			models['b3'].position.x = 1.6
			models['b3'].position.y = 1.8
			models['b3'].rotation.setFromVector3(new THREE.Vector3( 0, 0, -Math.PI / 4));
			g2.add(models['b3']);

			models['c1'].add(g3);
			models['c3'].position.z = -2.3
			models['c3'].position.y = 0.5
			g3.add(models['c3']);

			models['c3'].add(g4);
			models['c2'].position.z = -2.3
			models['c2'].position.y = -0.5
			g4.add(models['c2']);

			models['c2'].add(g5);
			models['c4'].position.z = -2.3
			models['c4'].position.y = 0.5
			models['b6'].position.z = -2.3
			models['b6'].position.x = -0.8;
			models['b6'].position.y = -0.4;
			models['b6'].rotation.setFromVector3(new THREE.Vector3( 0, 0, -Math.PI / 7));
			g5.add(models['b6']);
			models['b7'].position.z = -2.3
			models['b7'].position.x = 0.8;
			models['b7'].position.y = -0.4;
			models['b7'].rotation.setFromVector3(new THREE.Vector3( 0, 0, Math.PI / 7));
			g5.add(models['b7']);
			g5.add(models['c4']);
// ---YOUR CODE ENDS HERE---
		}
		// animate the scene
// ===YOUR CODE STARTS HERE===
		function rotateBandB2(level_1, angle) {	
			let stop_angle = angle;
			let rot_band = 0.05;
			if(0-rot_band <= level_1.rotation.z && level_1.rotation.z <= 0+rot_band) {
				rot_fw_b2 = true;
			} else if(stop_angle-rot_band <= level_1.rotation.z && level_1.rotation.z <= stop_angle+rot_band) {
				rot_fw_b2 = false;
			}
			if(rot_fw_b2) {
				level_1.rotateZ(0.01*animation_speed);
			}
			else {
				level_1.rotateZ(-0.01*animation_speed);
			}
		}

		function rotateBandB3(level_1, angle) {
			if(!rot_fw_b2) {
				level_1.rotateZ(0.01*animation_speed);
			}
			else {
				level_1.rotateZ(-0.01*animation_speed);
			}
		}
		rotateBandB2(g1, Math.PI/5);
		rotateBandB3(g2, Math.PI/5);

		function rotateBandC3(level_1, angle) {	
			let stop_angle = angle;
			let rot_band = 0.05;
			if(0-rot_band <= level_1.rotation.x && level_1.rotation.x <= 0+rot_band) {
				rot_fw_c4 = true;
			} else if(stop_angle-rot_band <= level_1.rotation.x && level_1.rotation.x <= stop_angle+rot_band) {
				rot_fw_c4 = false;
			}
			if(rot_fw_c4) {
				level_1.rotateX(0.01*animation_speed);
			}
			else {
				level_1.rotateX(-0.01*animation_speed);
			}
		}
		function rotateBandOpp(level_1, angle) {	
			if(!rot_fw_c4) {
				level_1.rotateX(0.02*animation_speed);
			}
			else {
				level_1.rotateX(-0.02*animation_speed);
			}
		}
		function rotateBandC2(level_1, angle) {	
			if(rot_fw_c4) {
				level_1.rotateX(0.02*animation_speed);
			}
			else {
				level_1.rotateX(-0.02*animation_speed);
			}
		}
		rotateBandC3(scene, Math.PI/6);
		rotateBandOpp(g3, Math.PI/6);
		rotateBandC2(g4, Math.PI/6);
		rotateBandOpp(g5, Math.PI/6);
// ---YOUR CODE ENDS HERE---
	}
	light0.position.set(camera.position.x, camera.position.y, camera.position.z); // light0 always follows camera position
	renderer.render(scene, camera);
}

animate();

function onKeyDown(event) {
	switch(event.key) {
		case 'w':
		case 'W':
			material.wireframe = !material.wireframe;
			break;
		case '=':
		case '+':
			animation_speed += 0.05;
			document.getElementById('msg').innerHTML = 'animation_speed = '+animation_speed.toFixed(2);
			break;
		case '-':
		case '_':
			if(animation_speed>0) animation_speed-=0.05;
			document.getElementById('msg').innerHTML = 'animation_speed = '+animation_speed.toFixed(2);
			break;
		case 'r':
		case 'R':
			orbit.reset();
			break;
	}
}

window.addEventListener('keydown', onKeyDown, false); // as key control if you need
