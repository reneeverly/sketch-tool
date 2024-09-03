var input_manager = {
	currently_drawing: false,
	points: [],
	stroke_history: [],
	stroke_redo: [],
	color: 'rebeccapurple'
}

obscura.addEventListener('touchstart', begin_drawing)
obscura.addEventListener('mousedown', begin_drawing)
function begin_drawing(e) {
	input_manager.currently_drawing = true

	input_manager.points.push(get_coordinates(e))
	draw_points_to_canvas()
}

obscura.addEventListener('touchmove', do_nothing)
obscura.addEventListener('mousemove', do_nothing)
function do_nothing(e) {
	e.preventDefault() // Maybe this fixes the iOS issue? Seems to!
}
obscura.addEventListener('pointermove', new_points, {"capture": true}, true) /* getCoalescedEvents? */
function new_points(e) {
	if (!input_manager.currently_drawing) return
	e.preventDefault()
	if (typeof e.getCoalescedEvents != 'undefined') {
		var coax = e.getCoalescedEvents()
		for (let i = 0; i < coax.length; i++) {
			input_manager.points.push(get_coordinates(coax[i]))
			draw_points_to_canvas()
		}
	} else {
		input_manager.points.push(get_coordinates(e))
	}
	draw_points_to_canvas()
}

// Generalize pointer up function
obscura.addEventListener('touchend', end_drawing)
obscura.addEventListener('touchleave', end_drawing)
document.addEventListener('mouseup', end_drawing)
function end_drawing(e) {
	if (input_manager.currently_drawing) {
		input_manager.currently_drawing = false
		input_manager.stroke_redo = []
		do_when_not_busy(() => { input_manager.stroke_history.push({"color":input_manager.color, "points":input_manager.points}); input_manager.points = [] })
	}
	if (currently_hue_selecting) {
		onSVGMouseUp()
	}
}

function get_coordinates(e) {
	console.log(e)
	if (typeof e.pressure !== 'undefined' && e.pointerType == 'pen') {
		return [e.pageX, e.pageY, Math.max(0.1, e.pressure)]
	} else {
		return [e.pageX, e.pageY, 0]
	}
}

do_when_not_busy = window.requestIdleClassback || function(fn) { setTimeout(fn, 1) }

function undo() {
	let previous = input_manager.stroke_history.pop()
	if (typeof previous === 'undefined') return
	input_manager.stroke_redo.push(previous)

	rerender(CANVAS_MODE)
}

function redo() {
	let next = input_manager.stroke_redo.pop()
	if (typeof next === 'undefined') return
	input_manager.stroke_history.push(next)

	rerender(CANVAS_MODE)
}
