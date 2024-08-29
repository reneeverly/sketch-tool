context = obscura.getContext('2d')
obscura.width = window.innerWidth * 2
obscura.height = window.innerHeight * 2
var TWOPI = 2 * Math.PI

function draw_points_to_canvas() {
	context.lineCap = 'round'
	context.lineJoin = 'round'

	var pt = input_manager.points[input_manager.points.length - 1]

	context.fillStyle = input_manager.color
	if (input_manager.points.length > 1) {
		var pv = input_manager.points[input_manager.points.length - 2]
		draw_segment(pv, pt, input_manager.color, 'canvas')
	}
	//context.beginPath()
	//context.arc(pt[0], pt[1], 2.5, 0, 2 * Math.PI)
	//context.fill()
}

function draw_segment(pv, pt, color, mode) {
	// check for singlepoint
	if (pv[0] == pt[0] && pt[1] == pv[1]) return false
	var jitter = 0.75
	var radius = 1.6 // 0.1/24*768/2
	var distance_clicky = 1.2//2

	var length = Math.sqrt(Math.pow(pt[0] - pv[0], 2) + Math.pow(pt[1] - pv[1], 2),2)
	if (length < distance_clicky && Math.floor(Math.random() * 2)) return false

	var vector = [((pt[0] - pv[0]) / length) * distance_clicky, ((pt[1] - pv[1]) / length) * distance_clicky]

	for (var x = pv[0], y = pv[1];Math.sqrt(Math.pow(x - pv[0], 2) + Math.pow(y - pv[1], 2), 2) < length; x += vector[0], y += vector[1]) {
		context.beginPath()
		context.arc(x*2, y*2, radius*2 * ((Math.floor(Math.random() * 2)) ? (jitter) : (1)), 0, TWOPI)
		context.fill()
	}

	//if (mode == 'canvas') {
		//context.strokeStyle = input_manager.color
		//context.lineWidth = 2
		//context.beginPath()
		//context.moveTo(pv[0], pv[1])
		//context.lineTo(pt[0], pt[1])
		//context.stroke()
	//} else {
	//}
	return true
}
