function displayBrushOpenDialog() {
	var fop = document.createElement('input')
	fop.type = 'file'
	fop.accept = '.abr,.gbr'
	fop.addEventListener('change', addBrushesFromFile)
	fop.dispatchEvent(new MouseEvent('click'))
}

function addBrushesFromFile(e) {
	fr = new FileReader()
	fr.onload = preProcessBrush
	fr.readAsBinaryString(e.target.files[0])
}

function preProcessBrush() {
	processBrush(fr.result)
}

function processBrush(binary_string) {
	binny = binary_string
	var new_brushes = []

	if (!binny.charCodeAt(1) == 6) {
		console.error('Brush is not ABR version 6')
		return
	}

	/*console.log('Number of Computed Brushes', binny.match(/computedBrush/g))
	console.log('Number of Sampled Brushes', binny.match(/sampledBrush/g))
	var nm_text = /Nm  TEXT/g
	while ((match = nm_text.exec(binny)) != null) {
		var string_length = binny.charCodeAt(match.index + 11) - 1
		var value = binny.substr(match.index + 12, string_length*2)
		console.log(string_length, UTF16toString(value))
	}*/

	var brush_section = binny.split('VlLs')[1]
	var number_of_sets = brush_section.charCodeAt(3)
	console.log('Number of sets of brushes:', number_of_sets)
	var sets = brush_section.split('brushPreset')
	sets.shift()
	for (var i = 0; i < sets.length; i++) {
		var number_of_brushes = sets[i].charCodeAt(3)
		console.log('Number of brushes in set:', number_of_brushes)
		// Negative lookbehind to avoid catching Texture Block as Brush
		// IdntTEXT has no Nm so not a concern
		// sampledDataText contains the unique ids
		var brushes = sets[i].split(/(?<!Ptrn........)Nm  TEXT/)
		brushes.shift()
		for (var j = 0; j < brushes.length; j++) {
			var brush_label_length = brushes[j].charCodeAt(3) - 1
			var brush_label_string = UTF16toString(brushes[j].substr(4, brush_label_length*2))

			// Things to get:
			// Size Jitter (currently implemented)
			// 'jitterUntF#Prc' from 0 to 100%
			// 12 characters (6 bytes) -> REAL48?
			var brush_jitter_match = brushes[j].match('jitterUntF#Prc')
			if (brush_jitter_match === null) continue
			//var brush_jitter = pascalReal48Import(brushes[j].substr(brush_jitter_match.index + 14, 12))
			var brush_jitter_string = brushes[j].substr(brush_jitter_match.index + 14, 12)
			brush_jitter_string = brush_jitter_string.substr(0,4) + brush_jitter_string.substr(8,4)
			console.log(brush_jitter_string)
			var brush_jitter = decodeFloat(brush_jitter_string, 1, 11, 52, -1022, 1023, true)

			// Spacing (currently implemented)
			// 'SpcnUntF#Prc' has log scale? from 0% to 1000%
			// Also occurs under Scattering?  So be careful I guess
			//var brush_spacing = pascalReal48Import(brushes[j].substr(brushes[j].match('SpcnUntF#Prc').index + 12, 12))
			var brush_spacing_string = brushes[j].substr(brushes[j].match('SpcnUntF#Prc').index + 12, 12)
			brush_spacing_string = brush_spacing_string.substr(0,4) + brush_spacing_string.substr(8,4)
			console.log(brush_spacing_string)
			var brush_spacing = decodeFloat(brush_spacing_string, 1, 11, 52, -1022, 1023, true)


			// Angle Jitter (not implemented, but was in Attempt 2)
			// Diameter (initial_size?  or a behind-the-scenes size normalizer?)
			// minimumDiameter (initial_sizez stuff for sure)

			// Airbrush?  What is that used for
			// useTipDynamics - does this disable pen pressure?

			// flipX, flipY - might be useful to preprocess before vectorizing

			new_brushes.push({"name": brush_label_string, "jitter": brush_jitter, "initial_size": 0, "spacing": brush_spacing, "shape": POINT_SHAPE_PATH, "path_pointer": ""})

		}
	}

	console.log(new_brushes)
	return new_brushes
}

function UTF16toString(binaryString) {
	// Is this UTF16 or UCS-2?
	var resultant = ''
	for (let i = 0; i < binaryString.length; i+=2) {
		resultant += String.fromCharCode((binaryString.charCodeAt(i) << 8) + binaryString.charCodeAt(i+1))
	}
	return resultant
}

function pascalReal48Import(binaryString) {
	// convert to bytes
	//var bytes = UTF16toString(binaryString)
	//console.log(binaryString, bytes)
	var bytes = binaryString.substr(0,6)

	// https://stackoverflow.com/questions/31928449/what-type-is-this-6-byte-48-bit-number-floating-point-integer

	var exponentbase = 129
	var exponent = bytes[0] - exponentbase

	var mantissa = 0.0
	var value = 1.0
	for (var i = 5; i >= 1; i--) {
		var startbit = 7
		if (i == 5) { startbit = 6 } // skip the sign bit

		for (var j = startbit; j >= 0; j--) {
			value = value / 2
			if (((bytes[i] >> j) & 1) == 1) {
				mantissa += value
			}
		}
	}

	if (mantissa == 1.0 && bytes[0] == 0) { return 0.0 }
	if ((bytes[5] & 0x80) == 1) {
		mantissa = -mantissa
	}
	return (1 + mantissa) * Math.pow(2.0, exponent)
}


// Derived from http://stackoverflow.com/a/8545403/106786
function decodeFloat(bytes, signBits, exponentBits, fractionBits, eMin, eMax, littleEndian) {
  var totalBits = (signBits + exponentBits + fractionBits);

  var binary = "";
  for (var i = 0, l = bytes.length; i < l; i++) {
    var bits = bytes[i].toString(2);
    while (bits.length < 8)
      bits = "0" + bits;

    if (littleEndian)
      binary = bits + binary;
    else
      binary += bits;
  }

  var sign = (binary.charAt(0) == '1')?-1:1;
  var exponent = parseInt(binary.substr(signBits, exponentBits), 2) - eMax;
  var significandBase = binary.substr(signBits + exponentBits, fractionBits);
  var significandBin = '1'+significandBase;
  var i = 0;
  var val = 1;
  var significand = 0;

  if (exponent == -eMax) {
      if (significandBase.indexOf('1') == -1)
          return 0;
      else {
          exponent = eMin;
          significandBin = '0'+significandBase;
      }
  }

  while (i < significandBin.length) {
      significand += val * parseInt(significandBin.charAt(i));
      val = val / 2;
      i++;
  }

  return sign * significand * Math.pow(2, exponent);
}
