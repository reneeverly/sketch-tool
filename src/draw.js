context = obscura.getContext('2d')
var SCALE_FACTOR = 2
var CANVAS_MODE = true
var SVG_MODE = false
obscura.width = window.innerWidth * SCALE_FACTOR
obscura.height = window.innerHeight * SCALE_FACTOR
var TWOPI = 2 * Math.PI

function draw_points_to_canvas() {
	context.lineCap = 'round'
	context.lineJoin = 'round'

	var pt = input_manager.points[input_manager.points.length - 1]

	context.fillStyle = input_manager.color
	//if (input_manager.points.length > 1) {
		var pv = input_manager.points[input_manager.points.length - 2]
		draw_segment(pv, pt, input_manager.color, CANVAS_MODE)
	//}
	//context.beginPath()
	//context.arc(pt[0], pt[1], 2.5, 0, 2 * Math.PI)
	//context.fill()
}

function draw_segment(pv, pt, color, mode) {
	// Get the color change out of the way!
	change_color(color, CANVAS_MODE)

	// check for undefined
	if (typeof pv === 'undefined') { return draw_single_point(pt[0]*SCALE_FACTOR, pt[1]*SCALE_FACTOR, 1.6*SCALE_FACTOR, mode) }

	// check for singlepoint
	if (pv[0] == pt[0] && pt[1] == pv[1]) return ''//false
	
	var jitter = 0.75
	var radius = 1.6 + pt[2] // 0.1/24*768/2
	var distance_clicky = 1.2//2

	var length = Math.sqrt(Math.pow(pt[0] - pv[0], 2) + Math.pow(pt[1] - pv[1], 2),2)

	// TODO: This isn't an ideal solution, but it's a nice stopgap.
	// The Problem: Moving the pen/mouse slowly results in a super thick line because the jitter is overridden by so many dots being on top of each other.
	// This imperfect solution: Remove half of the dots that would overlap.
	// Result: Sometimes SVG export has sections where there are zero dots for an annoyingly long portion of a curve.
	if (length < distance_clicky && Math.floor(Math.random() * 2)) return ''//false

	var vector = [((pt[0] - pv[0]) / length) * distance_clicky, ((pt[1] - pv[1]) / length) * distance_clicky]

	var resultant = ((mode == CANVAS_MODE) ? true : '')

	for (var x = pv[0], y = pv[1];Math.sqrt(Math.pow(x - pv[0], 2) + Math.pow(y - pv[1], 2), 2) < length; x += vector[0], y += vector[1]) {
		resultant += draw_single_point(x*SCALE_FACTOR, y*SCALE_FACTOR, radius*SCALE_FACTOR * ((Math.floor(Math.random() * 2)) ? jitter : 1), mode)
	}

	return resultant
}

function draw_single_point(x, y, r, mode) {
		if (mode == CANVAS_MODE) {
			context.beginPath()
			context.arc(x, y, r, 0, TWOPI)
			context.fill()
			return 0
		} else {
			return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>'
		}
}

// Adding this so that svg export groups points by stroke
function change_color(color, mode) {
	if (mode === CANVAS_MODE) {
		context.fillStyle = color
		return 0
	} else {
		return '<g fill="' + color + '">'
	}
}
