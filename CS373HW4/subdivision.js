/* CMPSCI 373 Homework 4: Subdivision Surfaces */

const panelSize = 600;
const fov = 35;
const aspect = 1;
let scene, renderer, camera, material, orbit, light, surface=null;
let nsubdiv = 0;

let coarseMesh = null;	// the original input triangle mesh
let currMesh = null;		// current triangle mesh

let flatShading = true;
let wireFrame = false;

let objNames = [
	'objs/box.obj',
	'objs/ico.obj',
	'objs/torus.obj',
	'objs/twist.obj',
	'objs/combo.obj',
	'objs/pawn.obj',
	'objs/bunny.obj',
	'objs/head.obj',
	'objs/hand.obj',
	'objs/klein.obj'
];

function id(s) {return document.getElementById(s);}
function message(s) {id('msg').innerHTML=s;}

function subdivide() {
	let currVerts = currMesh.vertices;
	let currFaces = currMesh.faces;
	let newVerts = [];
	let newFaces = [];
	/* You can access the current mesh data through
	 * currVerts and currFaces arrays.
	 * Compute one round of Loop's subdivision and
	 * output to newVerts and newFaces arrays.
	 */
// ===YOUR CODE STARTS HERE===
	let numVert = currVerts.length;
	let vertAdj = {};
	let vertNeigh = {};
	for (let i = 0; i < currFaces.length; ++i) {

		let trFace = currFaces[i];
		let pairs = [trFace.a, trFace.b, trFace.c];
		
		for (let i = 0; i < 3; ++i) {
			let key = 0;
			let a = pairs[i%3]; 
			let b = pairs[(i+1)%3];
			let c = pairs[(i+2)%3];

			if (a in vertNeigh) {
				vertNeigh[a].add(b);
				vertNeigh[a].add(c);
			} else {
				vertNeigh[a] = new Set([b, c]);
			}

			if (a > b) {
				a = pairs[(i+1)%3];
				b = pairs[i%3];
			}
			key = a * numVert + b;

			if (key in vertAdj) {
				vertAdj[key].n2 = c;
			} else {
				vertAdj[key] = {v1: a, v2: b, n1: c, n2: 0, index: 0};
			}

		}
	}

	for (let i = 0; i < currVerts.length; ++i) { 

		let k = vertNeigh[i].size;
		let w = (1/k)*((5/8) - Math.pow(((3/8) + (Math.cos(2*Math.PI/k))/4), 2));
		let v = currVerts[i];

		let wSumX = (1-(k*w))*v.x;
		let wSumY = (1-(k*w))*v.y;
		let wSumZ = (1-(k*w))*v.z;

		let vertSet = vertNeigh[i].values();
		for (let j = 0; j < k; ++j) {
			let nv = currVerts[vertSet.next().value];
			wSumX += (w * nv.x);
			wSumY += (w * nv.y);
			wSumZ += (w * nv.z);
		}
		newVerts.push(new THREE.Vector3(wSumX, wSumY, wSumZ));
	}

	let indexCounter = numVert;
	Object.keys(vertAdj).forEach(function(i) {
		let p1 = currVerts[vertAdj[i].v1];
		let p2 = currVerts[vertAdj[i].v2];
		let p3 = currVerts[vertAdj[i].n1];
		let p4 = currVerts[vertAdj[i].n2];

		let wSumX = (3/8)*p1.x + (3/8)*p2.x + (1/8)*p3.x + (1/8)*p4.x;
		let wSumY = (3/8)*p1.y + (3/8)*p2.y + (1/8)*p3.y + (1/8)*p4.y;
		let wSumZ = (3/8)*p1.z + (3/8)*p2.z + (1/8)*p3.z + (1/8)*p4.z;

		newVerts.push(new THREE.Vector3(wSumX, wSumY, wSumZ));
		vertAdj[i].index = indexCounter++;
	});

	for (let i = 0; i < currFaces.length; ++i) {

		let trFace = currFaces[i];
		let pairs = [trFace.a, trFace.b, trFace.c];
		let midpoints = [];
		
		for (let i = 0; i < 3; ++i) {
			let key = 0;
			let a = pairs[i%3]; 
			let b = pairs[(i+1)%3];

			if (a > b) {
				a = pairs[(i+1)%3];
				b = pairs[i%3];
			}
			key = a * numVert + b;
			midpoints.push(vertAdj[key].index);
		}
		newFaces.push(new THREE.Face3(pairs[0], midpoints[0], midpoints[2]));
		newFaces.push(new THREE.Face3(pairs[1], midpoints[1], midpoints[0]));
		newFaces.push(new THREE.Face3(pairs[2], midpoints[2], midpoints[1]));
		newFaces.push(new THREE.Face3(midpoints[2], midpoints[0], midpoints[1]));
	}

// ---YOUR CODE ENDS HERE---
	/* Overwrite current mesh with newVerts and newFaces */
	currMesh.vertices = newVerts;
	currMesh.faces = newFaces;
	/* Update mesh drawing */
	updateSurfaces();
}

window.onload = function(e) {
	// create scene, camera, renderer and orbit controls
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100 );
	camera.position.set(-1, 1, 3);
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(panelSize, panelSize);
	renderer.setClearColor(0x202020);
	id('surface').appendChild(renderer.domElement);	// bind renderer to HTML div element
	orbit = new THREE.OrbitControls(camera, renderer.domElement);
	
	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(camera.position.x, camera.position.y, camera.position.z);	// right light
	scene.add(light);

	let amblight = new THREE.AmbientLight(0x202020);	// ambient light
	scene.add(amblight);
	
	// create materials
	material = new THREE.MeshPhongMaterial({color:0xCC8033, specular:0x101010, shininess: 50});
	
	// create current mesh object
	currMesh = new THREE.Geometry();
	
	// load first object
	loadOBJ(objNames[0]);
}

function updateSurfaces() {
	currMesh.verticesNeedUpdate = true;
	currMesh.elementsNeedUpdate = true;
	currMesh.computeFaceNormals(); // compute face normals
	if(!flatShading) currMesh.computeVertexNormals(); // if smooth shading
	else currMesh.computeFlatVertexNormals(); // if flat shading
	
	if (surface!=null) {
		scene.remove(surface);	// remove old surface from scene
		surface.geometry.dispose();
		surface = null;
	}
	material.wireframe = wireFrame;
	surface = new THREE.Mesh(currMesh, material); // attach material to mesh
	scene.add(surface);
}

function loadOBJ(name) {
	loadOBJAsMesh(name, function(mesh) {
		coarseMesh = mesh;
		currMesh.vertices = mesh.vertices;
		currMesh.faces = mesh.faces;
		updateSurfaces();
		nsubdiv = 0;
	},
	function() {},
	function() {});
}

function onKeyDown(event) { // Key Press callback function
	switch(event.key) {
		case 'w':
		case 'W':
			wireFrame = !wireFrame;
			message(wireFrame ? 'wireframe rendering' : 'solid rendering');
			updateSurfaces();
			break;
		case 'f':
		case 'F':
			flatShading = !flatShading;
			message(flatShading ? 'flat shading' : 'smooth shading');
			updateSurfaces();
			break;
		case 's':
		case 'S':
		case ' ':
			if(nsubdiv>=5) {
				message('# subdivisions at maximum');
				break;
			}
			subdivide();
			nsubdiv++;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'e':
		case 'E':
			currMesh.vertices = coarseMesh.vertices;
			currMesh.faces = coarseMesh.faces;
			nsubdiv = 0;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'r':
		case 'R':
			orbit.reset();
			break;
			
	}
	if(event.key>='0' && event.key<='9') {
		let index = 9;
		if(event.key>'0')	index = event.key-'1';
		if(index<objNames.length) {
			loadOBJ(objNames[index]);
			message('loaded file '+objNames[index]);
		}
	}
}

window.addEventListener('keydown',  onKeyDown,  false);

function animate() {
	requestAnimationFrame( animate );
	//if(orbit) orbit.update();
	if(scene && camera)	{
		light.position.set(camera.position.x, camera.position.y, camera.position.z);
		renderer.render(scene, camera);
	}
}

animate();
