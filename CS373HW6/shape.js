/* Intersection structure:
 * t:        ray parameter (float), i.e. distance of intersection point to ray's origin
 * position: position (THREE.Vector3) of intersection point
 * normal:   normal (THREE.Vector3) of intersection point
 * material: material of the intersection object
 */
class Intersection {
	constructor() {
		this.t = 0;
		this.position = new THREE.Vector3();
		this.normal = new THREE.Vector3();
		this.material = null;
	}
	set(isect) {
		this.t = isect.t;
		this.position = isect.position;
		this.normal = isect.normal;
		this.material = isect.material;
	}
}

/* Plane shape
 * P0: a point (THREE.Vector3) that the plane passes through
 * n:  plane's normal (THREE.Vector3)
 */
class Plane {
	constructor(P0, n, material) {
		this.P0 = P0.clone();
		this.n = n.clone();
		this.n.normalize();
		this.material = material;
	}
	// Given ray and range [tmin,tmax], return intersection point.
	// Return null if no intersection.
	intersect(ray, tmin, tmax) {
		let temp = this.P0.clone();
		temp.sub(ray.o); // (P0-O)
		let denom = ray.d.dot(this.n); // d.n
		if(denom==0) { return null;	}
		let t = temp.dot(this.n)/denom; // (P0-O).n / d.n
		if(t<tmin || t>tmax) return null; // check range
		let isect = new Intersection();   // create intersection structure
		isect.t = t;
		isect.position = ray.pointAt(t);
		isect.normal = this.n;
		isect.material = this.material;
		return isect;
	}
}

/* Sphere shape
 * C: center of sphere (type THREE.Vector3)
 * r: radius
 */
class Sphere {
	constructor(C, r, material) {
		this.C = C.clone();
		this.r = r;
		this.r2 = r*r;
		this.material = material;
	}
	intersect(ray, tmin, tmax) {
// ===YOUR CODE STARTS HERE===
		let temp = this.C.clone();
		let a = ray.d.lengthSq();
		let b = ray.o.clone();
		b.sub(temp);
		b = 2 * (b.dot(ray.d));

		let c = ray.o.distanceToSquared(temp) - this.r2;

		let delta = (b*b) - 4*a*c;
		if (delta < 0) return null;

		let t = null;
		let t1 = (- b - Math.sqrt(delta))/2*a;
		let t2 = (- b + Math.sqrt(delta))/2*a;

		if (delta >= 0) {
			if (t1 > 0) t = t1;
			else if (t2 > 0) t = t2;
			else return null;
			
			if (t < tmin || t > tmax) return null;
		}

		let isect = new Intersection(); 
		isect.t = t;
		isect.position = ray.pointAt(t);
		let normal = ray.pointAt(t);
		normal.sub(temp);
		normal.normalize();
		isect.normal = normal;
		isect.material = this.material;
		return isect;

// ---YOUR CODE ENDS HERE---
	}
}

class Triangle {
	/* P0, P1, P2: three vertices (type THREE.Vector3) that define the triangle
	 * n0, n1, n2: normal (type THREE.Vector3) of each vertex */
	constructor(P0, P1, P2, material, n0, n1, n2) {
		this.P0 = P0.clone();
		this.P1 = P1.clone();
		this.P2 = P2.clone();
		this.material = material;
		if(n0) this.n0 = n0.clone();
		if(n1) this.n1 = n1.clone();
		if(n2) this.n2 = n2.clone();

		// below you may pre-compute any variables that are needed for intersect function
		// such as the triangle normal etc.
// ===YOUR CODE STARTS HERE===
		this.P2P0 = this.P2.clone();
		this.P2P0.sub(this.P0);

		this.P2P1 = this.P2.clone();
		this.P2P1.sub(this.P1);

		this.normDir = this.P2P0.clone();
		this.normDir.cross(this.P2P1);
		this.normDir.normalize();
// ---YOUR CODE ENDS HERE---
	}

	intersect(ray, tmin, tmax) {
// ===YOUR CODE STARTS HERE===
		function det(arr) {
			let det = arr[0][0] * (arr[1][1]*arr[2][2] - arr[1][2]*arr[2][1]) -
			arr[0][1] * (arr[1][0]*arr[2][2] - arr[1][2]*arr[2][0]) +
			arr[0][2] * (arr[1][0]*arr[2][1] - arr[1][1]*arr[2][0]);

			return det;
		}

		let matrixEq = [
			[ray.d.x, this.P2P0.x, this.P2P1.x],
			[ray.d.y, this.P2P0.y, this.P2P1.y],
			[ray.d.z, this.P2P0.z, this.P2P1.z]
		];

		let detEq = det(matrixEq);
		if (detEq == 0) return null;

		let P2O = this.P2.clone();
		P2O.sub(ray.o);

		let matT = [
			[P2O.x, this.P2P0.x, this.P2P1.x],
			[P2O.y, this.P2P0.y, this.P2P1.y],
			[P2O.z, this.P2P0.z, this.P2P1.z]
		];

		let matA = [
			[ray.d.x, P2O.x, this.P2P1.x],
			[ray.d.y, P2O.y, this.P2P1.y],
			[ray.d.z, P2O.z, this.P2P1.z]
		];

		let matB = [
			[ray.d.x, this.P2P0.x, P2O.x],
			[ray.d.y, this.P2P0.y, P2O.y],
			[ray.d.z, this.P2P0.z, P2O.z]
		];

		let t = det(matT)/detEq;
		let alpha = det(matA)/detEq;
		let beta = det(matB)/detEq;

		if (t < tmin || t > tmax) return null;
		if (alpha < 0 || beta < 0 || (alpha+beta) > 1 || t < 0) return null

		let isect = new Intersection();
		isect.t = t;
		isect.position = ray.pointAt(t);
		isect.normal = this.normDir;
		isect.material = this.material;
		return isect;
// ---YOUR CODE ENDS HERE---
	}
}

function shapeLoadOBJ(objname, material, smoothnormal) {
	loadOBJAsMesh(objname, function(mesh) { // callback function for non-blocking load
		if(smoothnormal) mesh.computeVertexNormals();
		for(let i=0;i<mesh.faces.length;i++) {
			let p0 = mesh.vertices[mesh.faces[i].a];
			let p1 = mesh.vertices[mesh.faces[i].b];
			let p2 = mesh.vertices[mesh.faces[i].c];
			if(smoothnormal) {
				let n0 = mesh.faces[i].vertexNormals[0];
				let n1 = mesh.faces[i].vertexNormals[1];
				let n2 = mesh.faces[i].vertexNormals[2];
				shapes.push(new Triangle(p0, p1, p2, material, n0, n1, n2));
			} else {
				shapes.push(new Triangle(p0, p1, p2, material));
			}
		}
	}, function() {}, function() {});
}

/* ========================================
 * You can define additional Shape classes,
 * as long as each implements intersect function.
 * ======================================== */
