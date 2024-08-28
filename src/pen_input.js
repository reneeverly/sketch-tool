var input_manager = {
	currently_drawing: false,
	points: [],
	stroke_history: []
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

obscura.addEventListener('touchend', end_drawing)
obscura.addEventListener('touchleave', end_drawing)
obscura.addEventListener('mouseup', end_drawing)
function end_drawing(e) {
	input_manager.currently_drawing = false
	do_when_not_busy(() => { input_manager.stroke_history.push(input_manager.points); input_manager.points = [] })
}

function get_coordinates(e) {
	//if (e.touches && e.touches[0] && typeof e.touches[0]["force"
	return [e.pageX, e.pageY]
}

do_when_not_busy = window.requestIdleClassback || function(fn) { setTimeout(fn, 1) }
