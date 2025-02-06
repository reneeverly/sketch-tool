// reneeverly/HSV-color-picker
// 

var color_selection_canvas = document.getElementById('color_selection_canvas')
var color_preview = document.getElementById('color_preview')
var color_previous = document.getElementById('color_previous')
var previous_colors_collection = document.getElementById('previous_colors_collection')

var hue = document.getElementById('hue')
var sat = document.getElementById('sat')
var val = document.getElementById('val')

function hsv_to_rgb(h, s, v) {
	var f = function (n) { var k=(n+h/60)%6; return v - v*s*Math.max(Math.min(k,4-k,1),0) }
	return [f(5), f(3), f(1)]
}

var square_width = 126 // 146
var square_height = 126 // 146
var ctx = color_selection_canvas.getContext('2d', {colorSpace: "srgb"})

var inner_radius = Math.sqrt(Math.pow(square_height, 2) + Math.pow(square_height, 2))/2

var square_x = color_selection_canvas.width/2 - square_width/2
var square_y = color_selection_canvas.height/2 - square_height/2

function draw_hue_circle() {
	var center_x = color_selection_canvas.width/2
	var center_y = color_selection_canvas.height/2

	var newimage = ctx.createImageData(color_selection_canvas.width, color_selection_canvas.height)
	var newctx = newimage.data

	for (var radius = inner_radius; radius < inner_radius + 18; radius += 1) {
		for (var degree = 0; degree < 360; degree += 0.25) {
			var x = Math.min(color_selection_canvas.width-1,Math.max(0,
				Math.floor(-radius * Math.cos(degree * Math.PI / 180) + center_x)
				))
			var y = Math.min(color_selection_canvas.height-1,Math.max(0,
				Math.floor(-radius * Math.sin(degree * Math.PI / 180) + center_y)
				))
			var index = 4 * (color_selection_canvas.width * y + x)
			var tri = hsv_to_rgb(degree, 1, 1)
			newctx[index + 0] = tri[0]*255
			newctx[index + 1] = tri[1]*255
			newctx[index + 2] = tri[2]*255
			newctx[index + 3] = 255
		}
	}

	ctx.putImageData(newimage, 0, 0)
	
}


function rerender_canvas_for_hue(h) {
	

	var newimage = ctx.createImageData(square_width, square_height)
	var newctx = newimage.data

	for (var plot_x = 0; plot_x < square_width; plot_x += 1) {
		for (var plot_y = 0; plot_y < square_height; plot_y += 1) {
			var tri = hsv_to_rgb(h, plot_x/square_width, 1-plot_y/square_height)
			var index = 4 * (square_width * plot_y + plot_x)
			newctx[index + 0] = Math.floor(tri[0]*255)
			newctx[index + 1] = Math.floor(tri[1]*255)
			newctx[index + 2] = Math.floor(tri[2]*255)
			newctx[index + 3] = 255
		}
	}
	ctx.putImageData(newimage, square_x, square_y)

	// Draw the hue circle!
}

function can_mouseup(e) {
	var rect = color_selection_canvas.getBoundingClientRect()
	var x = e.clientX - rect.left
	var y = e.clientY - rect.top
	var radius = Math.sqrt(Math.pow(x - color_selection_canvas.width/2, 2) + Math.pow(y - color_selection_canvas.height/2, 2))

	if (radius >= inner_radius) {

		var x_from_center = -x + color_selection_canvas.width/2
		var y_from_center = -y + color_selection_canvas.width/2
	
		// works for left half, right half broken

		var degree = Math.atan(y_from_center/x_from_center) * 180 / Math.PI

		if (x_from_center < 0) degree += 180

		// Update the ui to show this degree
		hue.value = degree

		console.log(x_from_center, y_from_center, degree)
		rerender_canvas_for_hue(Math.floor(degree))
	} else {

		// normalize coordinates to the square
		x -= square_x
		y -= square_y

		// clamp to square
		x = Math.min(square_width, Math.max(0, x))
		y = Math.min(square_width, Math.max(0, y))
		sat.value = x/square_width
		val.value = 1 - y/square_width
	}
	var tri = hsv_to_rgb(hue.value, sat.value, val.value)
	//color_previous.style.backgroundColor = color_preview.style.backgroundColor
	color_preview.style.backgroundColor = 'rgb(' + Math.floor(tri[0]*255) + ',' + Math.floor(tri[1]*255) + ',' + Math.floor(tri[2]*255) + ')'
}
color_selection_canvas.addEventListener('mouseup', function(e) { can_mouseup(e) })

function color_finalized() {
	// update the previous_color
	color_previous.style.backgroundColor = color_preview.style.backgroundColor

	// Add the new color to the list of previous colors
	var new_colorbox = document.createElement('div')
	new_colorbox.style.backgroundColor = color_preview.style.backgroundColor
	new_colorbox.setAttribute('title', color_preview.style.backgroundColor);
	previous_colors_collection.appendChild(new_colorbox)
	input_manager.color = color_preview.style.backgroundColor
}
color_preview.addEventListener('mouseup', color_finalized)

/* Initialization */

draw_hue_circle()
rerender_canvas_for_hue(hue.value)
var tri = hsv_to_rgb(hue.value, sat.value, val.value)
color_preview.style.backgroundColor = 'rgb(' + Math.floor(tri[0]*255) + ',' + Math.floor(tri[1]*255) + ',' + Math.floor(tri[2]*255) + ')'
