function export_as_svg() {
	var rawsvg = '<svg viewBox="0 0 ' + obscura.width + ' ' + obscura.height + '" xmlns="http://www.w3.org/2000/svg">' + rerender(SVG_MODE) + '</svg>'
	download(rawsvg, 'image/svg+xml', 'myimage.svg')
}

function download(data, mime, name) {
	var a = document.createElement('a')
	var blob = new Blob([data], {type: mime})
	var url = URL.createObjectURL(blob)
	a.setAttribute('href', url)
	a.setAttribute('download', name)
	a.click()
}

function rerender(mode) {
	var rawsvg = ((mode === CANVAS_MODE) ? 0 : '')

	if (mode === CANVAS_MODE) {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height)
	}

	for (var i = 0; i < input_manager.stroke_history.length; i++) {
		rawsvg += change_color(input_manager.stroke_history[i].color, mode)
		for (var j = 0; j < input_manager.stroke_history[i].points.length; j++) {
			var prevcoords = input_manager.stroke_history[i].points[j-1]
			var coords = input_manager.stroke_history[i].points[j]
			rawsvg += draw_segment(prevcoords, coords, input_manager.stroke_history[i].color, mode)
		}
		rawsvg += (mode === SVG_MODE) ? '</g>' : 0
	}

	return rawsvg
	
}
