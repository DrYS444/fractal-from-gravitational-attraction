
// const attractors = []

let prevGrid
let isPaused = false
let draggedAttractor = null
let dragOffset = { x: 0, y: 0 }

const getBasePalette = () => {
	const mode = settings.color?.palette ?? "ryb_primaries_secondaries"
	if (mode === "rgb_primaries") {
		// RGB primaries
		return ["#FF0000", "#00FF00", "#0000FF"]
	}
	// RYB primaries + secondaries (pintura)
	return [
		"#FF0000", // red
		"#FFFF00", // yellow
		"#0000FF", // blue
		"#FF7F00", // orange
		"#00FF00", // green
		"#8B00FF", // violet
	]
}

const getAttractorColorHex = (index) => {
	const palette = getBasePalette()
	return palette[index % palette.length]
}

const getClosestAttractor = (x, y) => {
	if (!settings?.attractors?.length) return null
	let best = null
	let bestDist = Infinity
	for (const a of settings.attractors) {
		const d = Math.hypot(a.position.x - x, a.position.y - y)
		if (d < bestDist) {
			bestDist = d
			best = a
		}
	}
	return { attractor: best, dist: bestDist }
}

const togglePause = () => {
	isPaused = !isPaused
}

const resetEverything = () => {
	resetGrid()
	rebuildPane?.()
}

const addAttractorAt = (x, y) => {
	const mass = settings.attractors[0]?.mass ?? 25
	const radius = settings.attractors[0]?.radius ?? 40
	const colorHex = getAttractorColorHex(settings.attractors.length)
	settings.attractors.push(new Attractor(x, y, mass, radius, colorHex))
	resetEverything()
}

const removeAttractor = (attractor) => {
	if (!attractor) return
	if (settings.attractors.length <= 1) return
	removeItemFromArray(attractor, settings.attractors)
	resetEverything()
}

const removeClosestAttractor = (x, y) => {
	const closest = getClosestAttractor(x, y)
	if (!closest?.attractor) return
	removeAttractor(closest.attractor)
}

window.appActions = window.appActions ?? {}
window.appActions.togglePause = togglePause
window.appActions.addAttractorAt = addAttractorAt
window.appActions.removeClosestAttractor = removeClosestAttractor
window.appActions.recolorAttractors = () => {
	settings.attractors.forEach((a, index) => {
		a.color = color(getAttractorColorHex(index))
	})
}

const isTypingIntoUI = () => {
	const ae = document.activeElement
	if (!ae) return false
	const tag = ae.tagName
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
	if (ae.isContentEditable) return true
	return false
}

function setup() {
  	createCanvas(windowWidth, windowHeight);
  	settings.grid = new Grid(settings.size)
	  setupTriangleAttractors(25,150)
	frameRate(60)

	settings.background = createGraphics(width, height)
	if(!settings.layers) settings.flattenLayer = createGraphics(width, height)
	settings.background.background(40)

	createPane()
}

function keyPressed() {
	if (isTypingIntoUI()) {
		return true
	}
	if (key === " ") {
		togglePause()
		return false
	}
	if (key === "a" || key === "A") {
		addAttractorAt(mouseX, mouseY)
		return false
	}
	if (key === "x" || key === "X" || keyCode === BACKSPACE || keyCode === DELETE) {
		if (draggedAttractor) {
			removeAttractor(draggedAttractor)
			draggedAttractor = null
			return false
		}
		removeClosestAttractor(mouseX, mouseY)
		return false
	}
	if (key === "r" || key === "R") {
		resetEverything()
		return false
	}
	return true
}

function mousePressed() {
	const hit = getClosestAttractor(mouseX, mouseY)
	if (!hit?.attractor) return true
	const threshold = Math.max(hit.attractor.radius / 2, 18)
	if (hit.dist > threshold) return true

	draggedAttractor = hit.attractor
	dragOffset = {
		x: draggedAttractor.position.x - mouseX,
		y: draggedAttractor.position.y - mouseY,
	}
	return false
}

function mouseDragged() {
	if (!draggedAttractor) return true
	draggedAttractor.position.set(mouseX + dragOffset.x, mouseY + dragOffset.y)
	return false
}

function mouseReleased() {
	draggedAttractor = null
	return false
}

const simulateSequentialBudgeted = () => {
	const maxMs = Math.max(1, settings.performance?.maxMsPerFrame ?? 12)
	const maxOuterSteps = Math.max(1, Math.floor(settings.speed ?? 1))
	const start = performance.now()

	let outerSteps = 0
	while (outerSteps < maxOuterSteps && performance.now() - start < maxMs) {
		settings.grid.ensureActiveCells()

		for (let cellIndex = settings.grid.activeCells.length - 1; cellIndex >= 0; cellIndex--) {
			const activeCell = settings.grid.activeCells[cellIndex]
			activeCell.mover.update()

			for (const attractor of settings.attractors) {
				const attracted = attractor.attract(activeCell.mover)
				if (attracted) continue

				settings.grid.fillActiveCell(attractor, activeCell)
				settings.grid.newActiveCell()
				break
			}
		}

		outerSteps++
	}
}

function draw() {
  	image(settings.background, 0, 0)

// createGrid(50)
	
	// First show the attractor layers
	if(settings.layers) {
		settings.attractors.forEach(a => {
			image(a.layer, 0, 0)
		})
	}
	
	if(!isPaused && settings.mode == "sequential"){
		simulateSequentialBudgeted()
	}

	if(!isPaused && settings.mode == "direct"){
		
		for (const activeCell of [...settings.grid.activeCells]) {
			let found = false
			let count = 0 
			do{
				activeCell.mover.update()
				for (const attractor of settings.attractors) {
					const attracted = attractor.attract(activeCell.mover)
					if(!attracted) {
						settings.grid.fillActiveCell(attractor, activeCell)
						settings.grid.newActiveCell()
						found = true
						break
					}
				}
			} while(!found)

			}
		// 	settings.grid.mover.update()

		// 	for (const attractor of settings.attractors) {
				
		// 		const attracted = attractor.attract(settings.grid.mover)
		// 		if(!attracted) {
					
		// 			settings.grid.fillActiveCell(attractor, settings.grid.activeCell)
		// 			settings.grid.newActiveCell()
		// 			found = true
		// 			break
		// 		}
				
		// 	}

		// 	if(count > 5000) {
		// 		console.log("5000")
		// 		const attractor = settings.grid.mover.closestAttractor(settings.attractors)
		// 		settings.grid.fillActiveCell(attractor)
		// 		settings.grid.newActiveCell()
		// 		found = true
				
		// 	}

		// 	count++
			
		// } while(!found)
		// settings.grid.mover.display()
			
	}

	

	if (settings.debug?.drawMovers) {
		for (const activeCell of settings.grid.activeCells) {
			activeCell.mover.display()
		}
	}

	if (settings.debug?.drawAttractors !== false) {
		settings.attractors.forEach((a) => {
			a.display()
		})
	}
}

function setupTriangleAttractors(mass, radius) {
	const p1 = {
		x: width/2 + radius * Math.cos(Math.PI * 3/2),
		y: height/2 + radius * Math.sin(Math.PI * 3/2)
	}
	const p2 = {
		x: width/2 + radius * Math.cos(Math.PI * 1/6),
		y: height/2 + radius * Math.sin(Math.PI * 1/6)
	}
	const p3 = {
		x: width/2 + radius * Math.cos(Math.PI * 5/6),
		y: height/2 + radius * Math.sin(Math.PI * 5/6)
	}

	settings.attractors.push(new Attractor(p1.x, p1.y, mass, 40, getAttractorColorHex(0)))
	settings.attractors.push(new Attractor(p2.x, p2.y, mass, 40, getAttractorColorHex(1)))
	settings.attractors.push(new Attractor(p3.x, p3.y, mass, 40, getAttractorColorHex(2)))
	// settings.attractors.push(new Attractor(width/2, height/2, mass/2, 20 , "#FF7A00"))



}

function setupSquareAttractors(mass, radius) {
	const ratio =  height/width
	const p1 = {
		x: width/2 - radius,
		y: height/2 - radius * ratio
	}
	const p2 = {
		x: width/2 + radius,
		y: height/2 - radius * ratio
	}
	const p3 = {
		x: width/2 + radius,
		y: height/2 + radius * ratio
	}
	const p4 = {
		x: width/2 - radius,
		y: height/2 + radius * ratio
	}
	settings.attractors.push(new Attractor(width/2, height/2, mass*0.25, 25, getAttractorColorHex(0)))
	settings.attractors.push(new Attractor(p1.x, p1.y, mass*0.99, 40, getAttractorColorHex(1)))
	settings.attractors.push(new Attractor(p2.x, p2.y, mass*1.01, 40, getAttractorColorHex(2)))
	settings.attractors.push(new Attractor(p3.x, p3.y, mass, 40, getAttractorColorHex(3)))
	settings.attractors.push(new Attractor(p4.x, p4.y, mass, 40, getAttractorColorHex(4)))
}

function saveGridResults(name){
	if(settings.layers) {
	
		settings.attractors.forEach((a, i) => {
			// a.layer.drawingContext.imageSmoothingEnabled = true
			settings.background.image(a.layer, 0, 0)
			// a.layer.save(name + "_" + i + ".png")
		})

		settings.attractors.forEach(a => a.layer = createGraphics(width, height))
	} else {
		settings.background.image(settings.flattenLayer, 0, 0)
	}

}

function setupWindowAttractors(mass, radius) {
	const ratio =  height/width
	const p1 = {
		x: width/2,
		y: height/2 - (radius * ratio)
	}
	const p2 = {
		x: width/2 + radius,
		y: height/2
	}
	const p3 = {
		x: width/2,
		y: height/2 + (radius * ratio)
	}
	const p4 = {
		x: width/2 - radius,
		y: height/2
	}
	settings.attractors.push(new Attractor(p4.x, p4.y, mass, 20 , getAttractorColorHex(0)))
	settings.attractors.push(new Attractor(p3.x, p3.y, mass, 20 , getAttractorColorHex(1)))
	settings.attractors.push(new Attractor(p2.x, p2.y, mass*1.01, 20 , getAttractorColorHex(2)))

	settings.attractors.push(new Attractor(p1.x, p1.y, mass*0.98, 20 , getAttractorColorHex(3)))

	settings.attractors.push(new Attractor(width/2, height/2, mass, 20 , getAttractorColorHex(4)))
}

function setupSpecialAttractors(mass, radius) {
	const ratio =  height/width

	const pointM = {
		x: width/2,
		y: height/2,
		color: color("#FFD600"),
		mass: mass*1.5,
		size: 20
	}
	
	const point1 = {
		x: width/2,
		y: height/4,
		color: color("#FF7A00"),
		mass: mass * 3,
		size: 20
	}
	const point2 = {
		x: 3*width/4,
		y: height/2,
		color: color("#FF0069"),
		mass: mass,
		size: 20
	}
	const point3 = {
		x: width/2,
		y: 3*height/4,
		color: color("#D300C5"),
		mass: mass * 3,
		size: 20
	}
	const point4 = {
		x: width/4,
		y: height/2,
		color: color("#7638FA"),
		mass: mass,
		size: 20
	}
	colorMode(HSB)
	const point1M2 = {
		x: (point1.x + point2.x + pointM.x)/3,
		y: (point1.y + point2.y + pointM.y)/3,
		color: lerpColor(point1.color, point2.color, 0.5),
		mass: (point1.mass + point2.mass + pointM.mass)/6,
		size: 15
	}
	const point2M3 = {
		x: (point2.x + point3.x + pointM.x)/3,
		y: (point2.y + point3.y + pointM.y)/3,
		color: lerpColor(point2.color, point3.color, 0.5),
		mass: (point2.mass + point3.mass+ pointM.mass)/6,
		size: 15
	}
	const point3M4 = {
		x: (point3.x + point4.x + pointM.x)/3,
		y: (point3.y + point4.y + pointM.y)/3,
		color: lerpColor(point3.color, point4.color, 0.5),
		mass: (point3.mass + point4.mass+ pointM.mass)/6,
		size: 15
	}
	const point4M1 = {
		x: (point1.x + point4.x + pointM.x)/3,
		y: (point1.y + point4.y + pointM.y)/3,
		color: lerpColor(point1.color, point4.color, 0.5),
		mass: (point1.mass + point4.mass+ pointM.mass)/6,
		size: 15
	}

	


	settings.attractors.push(new Attractor(point1.x, point1.y, point1.mass, point1.size , point1.color.toString()))

	settings.attractors.push(new Attractor(point2.x, point2.y, point2.mass, point2.size , point2.color.toString()))
	settings.attractors.push(new Attractor(point3.x, point3.y, point3.mass, point3.size , point3.color.toString()))
	settings.attractors.push(new Attractor(point4.x, point4.y, point4.mass, point4.size ,point4.color.toString()))

	// settings.attractors.push(new Attractor(pointM.x, pointM.y, pointM.mass, pointM.size ,pointM.color.toString()))
	settings.attractors.push(new Attractor(point1M2.x, point1M2.y, point1M2.mass, point1M2.size ,point1M2.color.toString()))
	settings.attractors.push(new Attractor(point2M3.x, point2M3.y, point2M3.mass, point2M3.size ,point2M3.color.toString()))
	settings.attractors.push(new Attractor(point3M4.x, point3M4.y, point3M4.mass, point3M4.size ,point3M4.color.toString()))
	settings.attractors.push(new Attractor(point4M1.x, point4M1.y, point4M1.mass, point4M1.size ,point4M1.color.toString()))
}