context = obscura.getContext('2d')
obscura.width = window.innerWidth
obscura.height = window.innerHeight

function draw_points_to_canvas() {
	context.strokeStyle = 'black'
	context.lineCap = 'round'
	context.lineJoin = 'round'

	var pt = input_manager.points[input_manager.points.length - 1]

	context.fillStyle = 'black'
	//context.lineWidth = 3
	//context.beginPath()
	//context.moveTo(pt[0], pt[1])
	//context.stroke()
	context.fillRect(pt[0], pt[1], 5, 5)
}
