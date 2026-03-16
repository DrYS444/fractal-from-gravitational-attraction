class Mover {
	constructor(x, y, m, r) {
		this.position = createVector(x, y)
		this.mass = m
		this.radius = r
		this.count = 0
		this.hitcount = 0
		this.vel = createVector(0,0)
		this.acc = createVector(0,0)
		this.G = 9.81/2

		this.applyPendulumForce()

		// this.layer = createGraphics(width, height)
	}

	display() {
		// this.layer.push()
		// const c = color(220)
		// c.setAlpha(128/3)
		// this.layer.fill(c)
		// c.setAlpha(255/2)
		// this.layer.stroke(c)
		// this.layer.strokeWeight(this.radius * 0.2)
		// this.layer.circle(this.position.x, this.position.y, this.radius)
		// this.layer.pop()
		// this.G = 9.81
		// image(this.layer, 0, 0)

		const c = color(220)
		fill(c)
		noStroke()
		circle(this.position.x, this.position.y, this.radius)

	}

	update(){
		// this.applyPendulumForce()

		
		this.vel.add(this.acc);
		

   		this.position.add(this.vel);
    	this.acc.set(0, 0);
		// if(this.count == 1250){
		// 	const noise = p5.Vector.random2D()
		// 	noise.mult(5)
		// 	this.position.add(noise);
		// 	this.applyPendulumForce()

		// 	// this.count = 0
		// 	// noLoop()
		// }
		
		if(this.count >= 5000) {
			if(this.count == 7500) {
				const closest = this.closestAttractor()
				const dist = Math.hypot(closest.position.x-this.position.x, closest.position.y - this.position.y)
				const newPos = createVector(closest.position.x-this.position.x, closest.position.y - this.position.y)
				newPos.setMag(dist/2)
				// console.log(this.position.x, this.position.y)
				this.position.set(newPos.x + this.position.x, newPos.y + this.position.y)
				// console.log(this.position.x, this.position.y)
				// console.log("7500")
				this.count = 0
			}
			if(this.count == 5000) {
				const closest = this.closestAttractor()
				const dist = Math.hypot(closest.position.x-this.position.x, closest.position.y - this.position.y)
				const newPos = createVector(closest.position.x-this.position.x, closest.position.y - this.position.y)
				newPos.setMag(dist/2)
				this.position.set(newPos.x + this.position.x, newPos.y + this.position.y)
			}
			// this.vel.set(0,0)
			// this.acc.set(3,3)
			
			// this.position.add(noise);
			// this.position.add(noise);
			// this.position.add(noise);
			// this.applyPendulumForce()

			// console.log("2500 error")
		}

		// if(this.count > 2500 && this.count < 2550) {
		// 	this.vel.set(0,0)
		// 	this.acc.set(0,0)
		// 	const noise = p5.Vector.random2D()
			
		// 	this.position.add(noise);
		// 	this.position.add(noise);
		// 	this.position.add(noise);
		// 	this.applyPendulumForce()
		// 	// this.count = 0

		// 	// console.log("2500 error")
		// }
		this.count++
		
	}

	applyForce(force) {
		const accForce = p5.Vector.div(force, this.mass)
		this.acc.add(accForce)
	}

	applyForceXY(fx, fy) {
		this.acc.x += fx / this.mass
		this.acc.y += fy / this.mass
	}

	closestAttractor() {
		let dist = Infinity
		let closestAtt
		settings.attractors.forEach(a => {
			const distAtt = Math.hypot(this.position.x - a.position.x, this.position.y - a.position.y)
			if(distAtt < dist) {
				dist = distAtt
				closestAtt = a
			}
		});

		return closestAtt
	}

	applyPendulumForce(){
		const dx = width / 2 - this.position.x
		const dy = height / 2 - this.position.y
		const lengthString = Math.hypot(width / 2, height / 2)
		const dist = Math.min(Math.hypot(dx, dy), lengthString)
		if (dist === 0) return

		const strength = Math.asin(dist / lengthString) * this.G * this.mass * (1 / dist)
		const scale = strength / dist
		this.acc.x += dx * scale
		this.acc.y += dy * scale
	}
}