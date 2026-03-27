class Cell {
	constructor(x, y, size) {
		this.position = createVector(x, y)
		this.size = size
		this.filled = false
		this.mover = new Mover(this.position.x, this.position.y, settings.mover.mass, settings.mover.radius)
		this.attractor = {}

	}
	display() {
		if(this.filled){
			if(settings.layers == true){
				this.attractor.layer.push()
				this.attractor.layer.rectMode(RADIUS);
				this.attractor.layer.noStroke()
				this.attractor.color.setAlpha(255)
				this.attractor.layer.fill(this.attractor.color)
				this.attractor.layer.square(this.position.x, this.position.y, this.size/2)
				this.attractor.layer.pop()
			} else {
				settings.flattenLayer.push()
				settings.flattenLayer.rectMode(RADIUS)
				settings.flattenLayer.noStroke()
				this.attractor.color.setAlpha(255)
				settings.flattenLayer.fill(this.attractor.color)
				settings.flattenLayer.square(this.position.x, this.position.y, this.size/2)
				settings.flattenLayer.pop()
			}
		}
	}

	split(n) {
		const newCells = []
		const newTileSize = this.size/n
		for (let r = 0; r < n; r++) {
			for (let c = 0; c < n; c++) {
				const x = (c * newTileSize) + this.position.x
				const y = (r * newTileSize) + this.position.y
				const cell = new Cell(x - (newTileSize/2), y - (newTileSize/2), newTileSize)
				cell.difficulty = this.difficulty
				newCells.push(cell)
			}
			
		}
		return newCells
	}
}