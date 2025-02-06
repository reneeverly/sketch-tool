// ^ lightness 0 to 100
// -> saturation 0 to 100

var currently_hue_selecting = false
var currently_col_selection = false


// Where hue is 0 -> 255
function update_gradient(hue) {
	var ctx = color_square.getContext('2d')
	var scale = 139
	for (var v = scale; v >= 0; v--) {
		for (var s = 0; s <= scale; s++) {
			var rgb = hsv_to_rgb(hue/255, s/scale, v/scale)
			ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",255)"
			ctx.fillRect(s, Math.abs(scale-v), 1, 1)
		}
	}
}
update_gradient(0)

function display_hue_gradient() {
	var ctx = color_square.getContext('2d')
	for (var h = 20; h <= 275; h++) {
		var rgb = hsv_to_rgb(h/255, 1, 1)
		ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",255)"
		ctx.fillRect(0, h-20, 255, 1)
	}
}

// https://codepen.io/philipnrmn/pen/mOVMOd

function angleFor(x, y) {
	return Math.atan(y / x);
}

function rtod(r) {
	return Math.round(r * (180 / Math.PI)) + 90;
}

function paddedHex(dec) {
	var hex = "00" + dec.toString(16);
	return hex.slice(-2);
}

function atoc(a) {
	var red = 0, green = 0, blue = 0;
	var colorPC = 255 / 60;
	if (a >= 300 || a <= 60) red = 255;
	if (a >= 60 && a <= 180) green = 255;
	if (a >= 180 && a <= 300) blue = 255;
	if (a > 0 && a < 60) {
		green = Math.round(a * colorPC);
	}
	if (a > 60 && a < 120) {
		red = Math.round((120 - a) * colorPC);
	}
	if (a > 120 && a < 180) {
		blue = Math.round((a - 120) * colorPC);
	}
	if (a > 180 && a < 240) {
		green = Math.round((240 - a) * colorPC);
	}
	if (a > 240 && a < 300) {
		red = Math.round((a - 240) * colorPC);
	}
	if (a > 300 && a < 360) {
		blue = Math.round((360 - a) * colorPC);
	}
	var hexString = '#' + paddedHex(red) + paddedHex(green) + paddedHex(blue);
	return hexString.toUpperCase();
}

function onSVGSelect (e) {
	var x = e.offsetX, y = e.offsetY;
	let midpoint = hue_wheel.getClientRects()[0].width  / 2
	var angle = angleFor(x - midpoint, y - midpoint);
	if (x < midpoint) {
		angle+=Math.PI;
	}
	var angleInDegrees = rtod(angle);
	var color = atoc(angleInDegrees)
	var hue = angleInDegrees/360*255

	var selectX = Math.cos(angle) * 200;
	var selectY = Math.sin(angle) * 200;

	hue_selector.setAttribute('cx', 200 + selectX);
	hue_selector.setAttribute('cy', 200 + selectY);
	hue_selector.setAttribute('fill', color);

	//hex.setAttribute('fill', color);
	//hex.setAttribute('stroke', color);
	//hex.textContent = color;
	update_gradient(hue)
	// TODO: this is temporary
	input_manager.color = color
}

function onSVGMouseDown() {
	hue_wheel.addEventListener('mousemove', onSVGSelect);
	color_square.className = 'behind'
	currently_hue_selecting = true
}
function onSVGMouseUp() {
	hue_wheel.removeEventListener('mousemove', onSVGSelect, false);
	color_square.className = ''
	currently_hue_selecting = false
}

/* Mouse events */
hue_wheel.addEventListener('click', onSVGSelect);
hue_wheel.addEventListener('mousedown', onSVGMouseDown);
hue_wheel.addEventListener('mouseup', onSVGMouseUp);

/* Touch events */
window.addEventListener('touchstart', function onWindowTouchStart() {
	hue_wheel.removeEventListener('click', onSVGSelect, false);
	hue_wheel.removeEventListener('mousedown', onSVGMouseDown, false);
	hue_wheel.removeEventListener('mousemove', onSVGSelect, false);
	hue_wheel.removeEventListener('mouseup', onSVGMouseUp, false);

	hue_wheel.addEventListener('touchmove', function onSVGTouchMove(e) {
		var rect = e.target.getBoundingClientRect();
		var touch = e.targetTouches[0];

		onSVGSelect.call(hue_wheel, {
			offsetX: touch.pageX - rect.left,
			offsetY: touch.pageY - rect.top
		});
	});

	window.removeEventListener('touchstart', onWindowTouchStart)
});
