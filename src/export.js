function export_as_svg() {
	// Minimum Viable Product
	var rawsvg = '<svg viewBox="0 0 ' + obscura.width + ' ' + obscura.height + '" xmlns="https://www.w3.org/2000/svg">'
	// TODO: generalize the canvas drawing functions to take an etching function as argument, that way we can reuse it here for the export with a different etcher
	for (var i = 0; i < input_manager.stroke_history.length; i++) {
		for (var j = 0; j < input_manager.stroke_history[i].length; j++) {
			var coords = input_manager.stroke_history[i][j]
			rawsvg += '<rect x="' + coords[0] + '" y="' + coords[1] + '" width="10" height="10" />'
		}
	}
	rawsvg += '</svg>'

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
