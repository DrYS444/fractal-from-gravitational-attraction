// Visual Effects Module - Professional Graphics Enhancements
// Implements motion trails, glow effects, and smooth color gradients

const VisualFX = {
	// Motion trails configuration
	trails: {
		enabled: true,
		decay: 0.92, // Lower = faster fade, Higher = longer trails
		minAlpha: 5,
	},
	
	// Glow effects configuration
	glow: {
		enabled: true,
		radius: 20,
		intensity: 0.6,
		blendMode: ADD,
	},
	
	// Color gradient smoothing
	gradients: {
		enabled: true,
		smoothTransitions: true,
		usePerceptualColors: true,
	},
	
	// Camera/View effects
	camera: {
		enabled: false,
		zoom: 1,
		panX: 0,
		panY: 0,
	},
	
	// Initialize visual effects
	init() {
		this.trailGraphics = createGraphics(width, height)
		this.glowGraphics = createGraphics(width, height)
		this.gradientBuffer = createGraphics(width, height)
	},
	
	// Apply motion trail effect
	applyTrail(graphics) {
		if (!this.trails.enabled) return
		
		graphics.push()
		graphics.fill(0, this.trails.decay * 255)
		graphics.rectMode(CORNER)
		graphics.noStroke()
		graphics.rect(0, 0, width, height)
		graphics.pop()
	},
	
	// Create glow effect around attractors
	createGlow(attractor) {
		if (!this.glow.enabled) return
		
		attractor.layer.push()
		attractor.layer.drawingContext.filter = `blur(${this.glow.radius}px)`
		
		const glowColor = attractor.color.copy()
		glowColor.setAlpha(255 * this.glow.intensity)
		attractor.layer.fill(glowColor)
		attractor.layer.noStroke()
		attractor.layer.circle(
			attractor.position.x,
			attractor.position.y,
			attractor.radius * 2.5
		)
		attractor.layer.pop()
	},
	
	// Smooth color interpolation using chroma.js
	interpolateColor(color1, color2, ratio) {
		if (!this.gradients.enabled || !window.chroma) {
			return lerpColor(color1, color2, ratio)
		}
		
		const c1 = chroma(color1.toString())
		const c2 = chroma(color2.toString())
		const interpolated = chroma.interpolate(c1, c2, ratio, 'lab')
		
		return color(interpolated.hex())
	},
	
	// Generate perceptually uniform palette
	generatePalette(baseColors, count) {
		if (!window.chroma || !this.gradients.usePerceptualColors) {
			return baseColors
		}
		
		const scale = chroma.scale(baseColors.map(c => chroma(c).hex()))
			.mode('lch')
			.colors(count)
		
		return scale
	},
	
	// Apply bloom/post-processing effect
	applyBloom(sourceGraphics, targetGraphics) {
		if (!this.glow.enabled) {
			targetGraphics.image(sourceGraphics, 0, 0)
			return
		}
		
		targetGraphics.push()
		targetGraphics.blendMode(this.glow.blendMode)
		targetGraphics.image(sourceGraphics, 0, 0)
		targetGraphics.pop()
	},
	
	// Render with all effects applied
	renderWithEffects(attractors, background) {
		// Apply trail decay to background
		if (this.trails.enabled) {
			this.applyTrail(background)
		}
		
		// Render each attractor layer with glow
		attractors.forEach(attractor => {
			if (this.glow.enabled) {
				this.createGlow(attractor)
			}
			
			background.push()
			background.blendMode(BLEND)
			background.image(attractor.layer, 0, 0)
			background.pop()
		})
	},
	
	// Update camera transform
	applyCameraTransform() {
		if (!this.camera.enabled) return
		
		push()
		translate(this.camera.panX, this.camera.panY)
		scale(this.camera.zoom)
	},
	
	// Reset camera
	resetCamera() {
		this.camera.zoom = 1
		this.camera.panX = 0
		this.camera.panY = 0
		pop()
	},
	
	// Create particle burst effect
	createParticleBurst(x, y, color, count = 10) {
		const particles = []
		for (let i = 0; i < count; i++) {
			const angle = TWO_PI * (i / count) + random(-0.2, 0.2)
			const speed = random(2, 8)
			particles.push({
				pos: createVector(x, y),
				vel: p5.Vector.fromAngle(angle).mult(speed),
				color: color.copy(),
				life: 255,
				decay: random(8, 15)
			})
		}
		return particles
	},
	
	// Update and render particles
	updateParticles(particles, graphics) {
		if (!particles || particles.length === 0) return
		
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i]
			p.pos.add(p.vel)
			p.life -= p.decay
			p.vel.mult(0.95) // friction
			
			if (p.life <= 0) {
				particles.splice(i, 1)
				continue
			}
			
			const c = p.color.copy()
			c.setAlpha(p.life)
			graphics.push()
			graphics.fill(c)
			graphics.noStroke()
			graphics.circle(p.pos.x, p.pos.y, 3)
			graphics.pop()
		}
	}
}

// Enhanced color utilities using chroma.js
const ColorUtils = {
	// Convert hex to HSL
	hexToHsl(hex) {
		if (!window.chroma) return null
		const hsl = chroma(hex).hsl()
		return { h: hsl[0], s: hsl[1], l: hsl[2] }
	},
	
	// Adjust color lightness
	adjustLightness(hex, amount) {
		if (!window.chroma) return hex
		return chroma(hex).set('hsl.l', '+=' + amount).hex()
	},
	
	// Adjust color saturation
	adjustSaturation(hex, amount) {
		if (!window.chroma) return hex
		return chroma(hex).set('hsl.s', '+=' + amount).hex()
	},
	
	// Generate complementary color
	getComplementary(hex) {
		if (!window.chroma) return hex
		return chroma(hex).rotate(180).hex()
	},
	
	// Generate analogous colors
	getAnalogous(hex, count = 3) {
		if (!window.chroma) return [hex]
		const step = 30
		const colors = []
		for (let i = 0; i < count; i++) {
			colors.push(chroma(hex).rotate(step * (i - Math.floor(count/2))).hex())
		}
		return colors
	},
	
	// Create gradient between colors
	createGradient(colors, steps) {
		if (!window.chroma) return colors
		return chroma.scale(colors).mode('lab').colors(steps)
	}
}

// Export for global access
window.VisualFX = VisualFX
window.ColorUtils = ColorUtils
