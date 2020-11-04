/* Ray class:
 * o: origin (THREE.Vector3)
 * d: normalized direction (THREE.Vector3)
 */
class Ray {
	constructor(origin, direction) {
		this.o = origin.clone();
		this.d = direction.clone();
		this.d.normalize();
	}
	pointAt(t) {
		// P(t) = o + t*d
		let point = this.o.clone();
		point.addScaledVector(this.d, t);
		return point;
	}
	direction() { return this.d; }
	origin() { return this.o; }
}

function render() {
	// create canvas of size imageWidth x imageHeight and add to DOM
	let canvas = document.createElement('canvas');
	canvas.width = imageWidth;
	canvas.height = imageHeight;
	canvas.style = 'background-color:red';
	document.body.appendChild(canvas);
	let ctx2d = canvas.getContext('2d'); // get 2d context
	let image = ctx2d.getImageData(0, 0, imageWidth, imageHeight); // get image data
	let pixels = image.data; // get pixel array

	let row=0;
	let idx=0;
	let chunksize=10; // render 10 rows at a time
	console.log('Raytracing started...');
	(function chunk() {
		// render a chunk of rows
		for(let j=row;j<row+chunksize && j<imageHeight;j++) {
			for(let i=0;i<imageWidth;i++,idx+=4) { // i loop
				// compute normalized pixel coordinate (x,y)
				let x = i/imageWidth;
				let y = (imageHeight-1-j)/imageHeight;

				// anti-aliasing
				let colorAlias = new THREE.Color(0, 0, 0);
				for (let m = 0; m < 4; m++) {
					let u = x + m*1/(imageWidth*4);
					for (let n = 0; n < 4; n++) {
						let v = y + n/4*(1 - ((imageHeight-1)/imageHeight));
						let ray = camera.getCameraRay(u,v);
						colorAlias = colorAlias.add(raytracing(ray, 0));
					}
				}
				setPixelColor(pixels, idx, colorAlias.multiplyScalar(1/16));
			}
		}
		row+=chunksize;  // non-blocking j loop
		if(row<imageHeight) {
			setTimeout(chunk, 0);
			ctx2d.putImageData(image, 0, 0); // display intermediate image
		} else {
			ctx2d.putImageData(image, 0, 0); // display final image
			console.log('Done.')
		}
	})();
}

function getEnvIntensity(dirVec) {

	function rgbeToFloat(idx) {
		if (probePix[idx+3] > 0) {
			let f = Math.pow(2, probePix[idx+3]-(128+8));
			return new THREE.Color(probePix[idx+0]*f, probePix[idx+1]*f, probePix[idx+2]*f);
		}
		return new THREE.Color(0, 0, 0);
	}

	dirVec = dirVec.clone();
	dirVec.normalize();
	let x = dirVec.x;
	let y = dirVec.y;
	let z = dirVec.z;

	let r = (1/Math.PI)*Math.acos(z)/Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	let u = ((x*r)+1)*probeWidth/2;
	let v = ((y*r)+1)*probeHeight/2;;

	let idx = 4*(Math.round(v)*probeWidth + Math.round(u));

	return rgbeToFloat(idx);
}

/* Trace ray in the scene and return color of ray. 'depth' is the current recursion depth.
 * If intersection material has non-null kr or kt, perform recursive ray tracing. */
function raytracing(ray, depth) {
	let color = new THREE.Color(0,0,0);
// ===YOUR CODE STARTS HERE===
	let isect = rayIntersectScene(ray);
	if (isect != null) {
		if ((isect.material.kr != null || isect.material.kt != null) && (depth < maxDepth)) {
			if (isect.material.kr) {
				let negDir = ray.d.clone();
				negDir.negate();
				let reflectCol = isect.material.kr.clone();
				let reflect_ray = new Ray(isect.position, reflect(negDir, isect.normal));
				reflectCol = reflectCol.multiply(raytracing(reflect_ray, depth+1));
				color = color.add(reflectCol);
			} 
			if (isect.material.kt) {
				let refractCol = isect.material.kt.clone();
				let refract_ray = new Ray(isect.position, refract(ray.d, isect.normal, isect.material.ior));
				refractCol = refractCol.multiply(raytracing(refract_ray, depth+1));
				color = color.add(refractCol);
			} 
		} else {
			let ambColor = ambientLight.clone();
			let ambRef = isect.material.ka ? isect.material.ka : 0;
			if (isect.material.ka) ambColor = ambColor.multiply(ambRef);
			color = color.add(ambColor);

			color = color.add(shading(ray, isect));
		}
		return color;
	} else {
		if (typeof probeDir !== 'undefined') {
			return getEnvIntensity(ray.d);
		}
		return backgroundColor;
	}
// ---YOUR CODE ENDS HERE---
}

/* Compute and return shading color given a ray and the intersection point structure. */
function shading(ray, isect) {
	let color = new THREE.Color(0,0,0);
// ===YOUR CODE STARTS HERE===
	for (let i = 0; i < lights.length; i++) {
		let ls = lights[i].getLight(isect.position);
		let shadowRay = new Ray(isect.position, ls.direction);
		let distToLightVector = ls.position.clone();
		distToLightVector.sub(isect.position);
		let distToLight = distToLightVector.length();
		let shadow_isect = rayIntersectScene(shadowRay);

		if (shadow_isect && shadow_isect.t < distToLight) 
			continue;

		if (isect.material.kd) {
			let diffColor = ls.intensity.clone();
			diffColor = diffColor.multiply(isect.material.kd);
			diffColor = diffColor.multiplyScalar(Math.max(isect.normal.dot(ls.direction), 0));
			color = color.add(diffColor);
		}

		if (isect.material.ks) {
			let specColor = ls.intensity.clone();
			specColor = specColor.multiply(isect.material.ks);
			let negDir = ray.d.clone();
			negDir.negate();
			specColor = specColor.multiplyScalar(Math.pow(Math.max(reflect(ls.direction, isect.normal).dot(negDir), 0), isect.material.p));
			color = color.add(specColor);
		}
	}
	// ambient occlusion
	let sucSampleAO = 0
	let ambOcc = 0;
	while (sucSampleAO < 300) {
		let theta = Math.acos(1 - (2*Math.random()));
		let phi = 2*Math.PI*Math.random();

		let x = Math.sin(theta)*Math.cos(phi);
		let y = Math.cos(theta);
		let z = Math.sin(theta)*Math.sin(phi);

		let dirVec = new THREE.Vector3(x, y, z);
		dirVec.normalize();
		let angDirNorm = dirVec.dot(isect.normal);
		if (angDirNorm > 0) {
			let ambIsect = rayIntersectScene(new Ray(isect.position, dirVec));
			if (ambIsect == null) {
				ambOcc += angDirNorm;
			}
			sucSampleAO += 1;
		}
	}
	ambOcc = ambOcc/sucSampleAO;
	color = color.multiplyScalar(ambOcc*2);

	// image based lighting
	if (typeof probeDir !== 'undefined') {
		let sucSampleIBL = 0
		let ibl = new THREE.Color(0, 0, 0);
		while (sucSampleIBL < 100) {
			let theta = Math.acos(1 - (2*Math.random()));
			let phi = 2*Math.PI*Math.random();
	
			let x = Math.sin(theta)*Math.cos(phi);
			let y = Math.cos(theta);
			let z = Math.sin(theta)*Math.sin(phi);
			
			let dirVec = new THREE.Vector3(x, y, z);
			dirVec.normalize();
			let angDirNorm = dirVec.dot(isect.normal);
			if (angDirNorm > 0) {
				let ambIsect = rayIntersectScene(new Ray(isect.position, dirVec));
				if (ambIsect == null) {
					let envColor = getEnvIntensity(dirVec);
					ibl = ibl.add(envColor.multiplyScalar(angDirNorm));
				}
				sucSampleIBL += 1;
			}
		}
		ibl = ibl.multiplyScalar(1/sucSampleIBL);
		color = color.add(ibl);
	}
// ---YOUR CODE ENDS HERE---
	return color;
}

/* Compute intersection of ray with scene shapes.
 * Return intersection structure (null if no intersection). */
function rayIntersectScene(ray) {
	let tmax = Number.MAX_VALUE;
	let isect = null;
	for(let i=0;i<shapes.length;i++) {
		let hit = shapes[i].intersect(ray, 0.0001, tmax);
		if(hit != null) {
			tmax = hit.t;
			if(isect == null) isect = hit; // if this is the first time intersection is found
			else isect.set(hit); // update intersection point
		}
	}
	return isect;
}

/* Compute reflected vector, by mirroring l around n. */
function reflect(l, n) {
	// r = 2(n.l)*n-l
	let r = n.clone();
	r.multiplyScalar(2*n.dot(l));
	r.sub(l);
	return r;
}

/* Compute refracted vector, given l, n and index_of_refraction. */
function refract(l, n, ior) {
	let mu = (n.dot(l) < 0) ? 1/ior:ior;
	let cosI = l.dot(n);
	let sinI2 = 1 - cosI*cosI;
	if(mu*mu*sinI2>1) return null;
	let sinR = mu*Math.sqrt(sinI2);
	let cosR = Math.sqrt(1-sinR*sinR);
	let r = n.clone();
	if(cosI > 0) {
		r.multiplyScalar(-mu*cosI+cosR);
		r.addScaledVector(l, mu);
	} else {
		r.multiplyScalar(-mu*cosI-cosR);
		r.addScaledVector(l, mu);
	}
	r.normalize();
	return r;
}

/* Convert floating-point color to integer color and assign it to the pixel array. */
function setPixelColor(pixels, index, color) {
	pixels[index+0]=pixelProcess(color.r);
	pixels[index+1]=pixelProcess(color.g);
	pixels[index+2]=pixelProcess(color.b);
	pixels[index+3]=255; // alpha channel is always 255*/
}

/* Multiply exposure, clamp pixel value, then apply gamma correction. */
function pixelProcess(value) {
	value*=exposure; // apply exposure
	value=(value>1)?1:value;
	value = Math.pow(value, 1/2.2);	// 2.2 gamma correction
	return value*255;
}
