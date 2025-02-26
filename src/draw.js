context = obscura.getContext('2d')
var SCALE_FACTOR = 2
var CANVAS_MODE = true
var SVG_MODE = false
obscura.width = window.innerWidth * SCALE_FACTOR
obscura.height = window.innerHeight * SCALE_FACTOR
var TWOPI = 2 * Math.PI

var POINT_SHAPE_CIRCLE = 0
var POINT_SHAPE_RECT = 1
var POINT_SHAPE_PATH = 2

var pens = [
	{"name": "Crayon", "jitter": 0.75, "initial_size": 1.6, "spacing": 0.375, "shape": POINT_SHAPE_CIRCLE},
	{"name": "Pen", "jitter": 1, "initial_size": 1.6, "spacing": 0.125, "shape": POINT_SHAPE_CIRCLE},
	{"name": "Square Brush", "jitter": 1, "initial_size": 1.6, "spacing": 0.05, "shape": POINT_SHAPE_RECT}
	]

function draw_points_to_canvas() {
	context.lineCap = 'round'
	context.lineJoin = 'round'

	var pt = input_manager.points[input_manager.points.length - 1]

	context.fillStyle = input_manager.color
	//if (input_manager.points.length > 1) {
		var pv = input_manager.points[input_manager.points.length - 2]
		draw_segment(pv, pt, input_manager.color, input_manager.size, input_manager.pen_number, CANVAS_MODE)
	//}
	//context.beginPath()
	//context.arc(pt[0], pt[1], 2.5, 0, 2 * Math.PI)
	//context.fill()
}

function draw_segment(pv, pt, color, size, pen_number, mode) {
	// Get the color change out of the way!
	change_color(color, CANVAS_MODE)

	var shape = pens[pen_number].shape

	// check for undefined
	if (typeof pv === 'undefined') { 
		return draw_single_point(pt[0]*SCALE_FACTOR, pt[1]*SCALE_FACTOR, size*SCALE_FACTOR, shape, mode)
	}

	// check for singlepoint
	if (pv[0] == pt[0] && pt[1] == pv[1]) return ''//false
	
	var jitter = pens[pen_number].jitter
	var radius = size * (1 + pv[2]) // 0.1/24*768/2
	var distance_clicky = pens[pen_number].spacing * radius * 2

	var length = Math.sqrt(Math.pow(pt[0] - pv[0], 2) + Math.pow(pt[1] - pv[1], 2),2)

	// TODO: This isn't an ideal solution, but it's a nice stopgap.
	// The Problem: Moving the pen/mouse slowly results in a super thick line because the jitter is overridden by so many dots being on top of each other.
	// This imperfect solution: Remove half of the dots that would overlap.
	// Result: Sometimes SVG export has sections where there are zero dots for an annoyingly long portion of a curve.
	if (pen_number == 0) {
		if (length < distance_clicky && Math.floor(Math.random() * 2)) return ''//false
	}

	var vector = [((pt[0] - pv[0]) / length) * distance_clicky, ((pt[1] - pv[1]) / length) * distance_clicky]

	var resultant = ((mode == CANVAS_MODE) ? true : '')

	for (var x = pv[0], y = pv[1];Math.sqrt(Math.pow(x - pv[0], 2) + Math.pow(y - pv[1], 2), 2) < length; x += vector[0], y += vector[1]) {
		resultant += draw_single_point(x*SCALE_FACTOR, y*SCALE_FACTOR, radius*SCALE_FACTOR * ((Math.floor(Math.random() * 2)) ? jitter : 1), shape, mode)
	}

	return resultant
}

function draw_single_point(x, y, r, shape, mode) {
	switch(shape) {
		case(POINT_SHAPE_CIRCLE):
			if (mode == CANVAS_MODE) {
				context.beginPath()
				context.arc(x, y, r, 0, TWOPI)
				context.fill()
				return 0
			} else {
				return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>'
			}
			break
		case(POINT_SHAPE_RECT):
			if (mode == CANVAS_MODE) {
				context.fillRect(x-r, y-r, r*2, r*2)
			} else {
				if (r == 0) return ''
				return '<rect x="' + (x-r) + '" y="' + (y-r) + '" width="' + (r*2) + '" height="' + (r*2) + '"/>'
			}
			break
		case(POINT_SHAPE_PATH):
			debugger
			if (mode == CANVAS_MODE) {
			} else {
			}
			break
		default:
			console.warn('Brush point type was not recognized:', shape)
			break
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

/* Initialization of Interface */
function add_brushes_to_brush_box() {
	brush_box.innerHTML = pens.map((a,i)=>'<button onclick="input_manager.pen_number = ' + i + '">' + a.name + '</button>').join('<br>')
}
add_brushes_to_brush_box()
