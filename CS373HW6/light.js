/* LightSample class:
 * intensity: intensity of the sample (THREE.Color3) 
 * position:  position of the sample (THREE.Vector3)
 * direction: light vector (i.e. normalized direction from shading point to the sample)
 */
class LightSample {
	constructor() {
		this.intensity = null;
		this.position = null;
		this.direction = null;
	}
}

/* PointLight class */
class PointLight {
	constructor(position, intensity) {
		this.position = position.clone();
		this.intensity = intensity.clone();
	}
	/* getLight returns a LightSample object
	 * for a given a shading point.
	 */
	getLight(shadingPoint) {
		let ls = new LightSample();
		ls.position = this.position.clone();
		ls.direction = this.position.clone();
		ls.direction.sub(shadingPoint);
		ls.intensity = this.intensity.clone();
		ls.intensity.multiplyScalar(1/ls.direction.lengthSq());	// quadratic falloff of intensity
		ls.direction.normalize();
		return ls;
	}
}

/* SpotLight class */
class SpotLight {
	/* from: position of spot light
	 * to:   target point
	 * exponent: akin to specular highlight's shininess
	 * cutoff: angle cutoff (i.e. 30 degrees etc.)
	 */
	constructor(from, to, intensity, exponent, cutoff) {
		this.from = from.clone();
		this.to = to.clone();
		this.intensity = intensity.clone();
		this.exponent = exponent; 
		this.cutoff = cutoff;
	}
	getLight(shadingPoint) {
// ===YOUR CODE STARTS HERE===
		// let ls = new LightSample();
		// ls.position = this.from.clone();
		// ls.direction = this.to.clone();
		// ls.direction.sub(this.from);
		// ls.direction.normalize();
		// ls.intensity = this.intensity.clone();

		// let shadDirection = shadingPoint.clone();
		// shadDirection.sub(this.from);
		// shadDirection.normalize();
		// let shadDirectionCos = shadDirection.dot(ls.direction);
		// // ls.intensity = ls.intensity.multiplyScalar(1/ls.direction.lengthSq());
		// // ls.intensity = ls.intensity.multiplyScalar(Math.pow(shadDirectionCos, this.exponent));
		// return ls;
		let ls = new LightSample();
		ls.position = this.from.clone();
		ls.direction = this.from.clone();
		ls.direction.sub(shadingPoint);
		ls.intensity = this.intensity.clone();

		let toFro = this.to.clone();
		toFro.sub(this.from);
		toFro.normalize();
		let shadDirection = shadingPoint.clone();
		shadDirection.sub(this.from);
		shadDirection.normalize();
		let shadDirectionCos = shadDirection.dot(toFro);
		if (shadDirectionCos > Math.cos(this.cutoff*(Math.PI/180))) {
			ls.intensity.multiplyScalar(Math.pow(shadDirectionCos, this.exponent));
			ls.intensity.multiplyScalar(1/ls.direction.lengthSq());
		} else {
			ls.intensity.multiplyScalar(0);
		}
		ls.direction.normalize();
		return ls;

// ---YOUR CODE ENDS HERE---
	}
}

// simulate an area light by discretizing it into NsxNs point lights
function createAreaLight(center, size, intensity, Ns) {
	intensity.multiplyScalar(size*size/Ns/Ns);	// each sampled light represents a fraction of the total intensity
	for(let j=0;j<Ns;j++) {
		for(let i=0;i<Ns;i++) {
			let position = new THREE.Vector3(center.x+(i/Ns-0.5)*size, center.y, center.z+(j/Ns-0.5)*size);
			lights.push(new PointLight(position, intensity));
		}
	}
}

/* ========================================
 * You can define additional Light classes,
 * as long as each implements getLight function.
 * ======================================== */
