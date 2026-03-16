const settings = {
	attractors: [],
	background: {},
	grid: {},
	size: 128,
	speed: 1,
	amount: 1,
	mode: "sequential",
	layers: true,
	flattenLayer: {},
	minHitCount: 0,
	color: {
		palette: "ryb_primaries_secondaries",
	},
	performance: {
		maxMsPerFrame: 12,
	},
	debug: {
		drawMovers: true,
		drawAttractors: true,
	},
	mover: {
		mass: 1,
		radius: 5
	}
}

// Expose settings globally (p5 sketches rely on globals).
window.settings = settings

let pane = null
try {
	if (window.Tweakpane?.Pane) {
		pane = new window.Tweakpane.Pane()
	}
} catch {
	pane = null
}

window.appActions = window.appActions ?? {}

function rebuildPane() {
	if (!window.Tweakpane?.Pane) return
	try {
		pane?.dispose?.()
	} catch {}
	pane = new window.Tweakpane.Pane()
	createPane()
}

window.rebuildPane = rebuildPane

function removeItemFromArray(item, array) {
	if (!Array.isArray(array)) return
	const itemIndex = array.indexOf(item)
	if (itemIndex < 0) return
	array.splice(itemIndex, 1)
}

function down(fileName = "layer") {
	noLoop()
	settings.attractors.forEach((a, i) => {
		a.layer.save(fileName + "_" + i + ".png")
	})
}

function createPane(){
	if (!pane) return
	const gridPane = pane.addFolder({
		title: "Grid"
	})
	gridPane.addInput(settings, "size", {
		step: 1,
	})
	gridPane.addInput(settings, "speed", {
		step: 1,
	})
	gridPane.addInput(settings, "amount", {
		step: 1,
	})

	gridPane.addInput(settings, "mode", {
		options: {
			direct: "direct",
			sequential: "sequential"
		},
	})

	const colorPane = pane.addFolder({
		title: "Color",
	})
	colorPane.addInput(settings.color, "palette", {
		options: {
			ryb_primaries_secondaries: "RYB primaries + secondaries",
			rgb_primaries: "RGB primaries",
		},
	}).on("change", () => {
		window.appActions?.recolorAttractors?.()
	})

	const perfPane = pane.addFolder({
		title: "Performance",
	})
	perfPane.addInput(settings.performance, "maxMsPerFrame", {
		min: 1,
		max: 33,
		step: 1,
	})

	const actionsPane = pane.addFolder({
		title: "Actions",
	})
	actionsPane.addButton({ title: "Add Attractor (center)" }).on("click", () => {
		window.appActions?.addAttractorAt?.(width / 2, height / 2)
	})
	actionsPane.addButton({ title: "Remove Closest Attractor" }).on("click", () => {
		window.appActions?.removeClosestAttractor?.(width / 2, height / 2)
	})
	actionsPane.addButton({ title: "Pause / Resume (space)" }).on("click", () => {
		window.appActions?.togglePause?.()
	})
	actionsPane.addButton({ title: "Rebuild UI" }).on("click", () => {
		rebuildPane()
	})

	gridPane.addButton({
		title: "Reset Grid"
	}).on("click", () => {
		resetGrid()

	})
	createAttractorsPane(gridPane)


}

function createAttractorsPane(gridPane){
	if (!pane) return
	const attractorPane = gridPane.addFolder({
		title: "attractor"
	})
	const myPages = []

	settings.attractors.forEach((a,i) => {
		const adjI = i + 1
		myPages.push({title: "A_" + adjI})
	})

	if (myPages.length === 0) return
	const tab = attractorPane.addTab({pages: myPages})

	settings.attractors.forEach((a,i) => {
		const attrSettings = {
			color: a.color.toString(),
			position: {x: a.position.x - width/2, y: a.position.y - height/2}
		}
		tab.pages[i].addInput(attrSettings, "color")
			.on("change", (ev) => a.color = color(ev.value))
		tab.pages[i].addInput(attrSettings, "position", {
			x: {min:-width/2, max: width/2},
			y: {min: -height/2, max: height/2}
		})
			.on("change", (ev) => a.position = createVector(ev.value.x + width/2, ev.value.y + height/2))
		tab.pages[i].addInput(a, "mass", {
			min: 0
		})
		tab.pages[i].addInput(a, "radius", {
			min: 0
		})
	})
}

function resetGrid(){
	settings.grid = new Grid(settings.size)
	settings.attractors.forEach(a => a.layer = createGraphics(width, height))
	settings.background.background(40)
}