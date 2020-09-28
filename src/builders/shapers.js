

/*
 * 
 *      Creates wave-shaper node for distortion
 * 
*/


// tells whether given type corresponds to a shaper node
export function checkShaperType(type) {
    return (/^shape/i.test(type))
}



// create a shaper node based on the input signal definition
export function createShaper(ctx, type) {
    // distortion type
    var arr = type.split('-')
    var curveType = arr[1]
    var numArg = parseFloat(arr[2])
    if (typeof numArg !== 'number') numArg = 5
    if (!curveCreators[curveType]) {
        console.warn('unknown curve type: ' + curveType)
        curveType = 'linear'
        numArg = 5
    }

    // shaper curve array
    var cachekey = curveType + '-' + numArg
    if (!curveCache[cachekey]) {
        curveCache[cachekey] = curveCreators[curveType](numArg)
    }
    var curve = curveCache[cachekey]

    // shaper node
    var shaper = ctx.createWaveShaper()
    shaper.curve = curve
    return shaper
}





// wave shaper curve creation / cache
var curveCache = {}
var curveCreators = {}


curveCreators.linear = (num) => {
    // fallback, no distortion
    return new Float32Array([-1, 1])
}

curveCreators.clip = (num) => {
    var v = num / 10
    return new Float32Array([-v, -v, 0, v, v])
}

curveCreators.boost = (num) => {
    var ct = Math.ceil(num / 2)
    var arr = new Float32Array(2 * ct + 1)
    for (var i = 0; i < arr.length; i++) {
        arr[i] = (i < ct) ? -1 :
            (i === ct) ? 0 : 1
    }
    return arr
}

curveCreators.fold = (num) => {
    var v = num / 10
    return new Float32Array([0, -v, 0, v, 0])
}


curveCreators.crush = (depth) => {
    depth = clamp(1, depth, 40)
    var steps = depth / 2
    var N = 255
    var arr = new Float32Array(N)
    for (var i = 0; i < N; i++) {
        var x = -1 + 2 * (i / (N - 1))
        arr[i] = Math.round((x + 1) * steps) / steps - 1
    }
    return arr
}



curveCreators.thin = (num) => {
    var pow = 1 + num
    pow = clamp(1.5, pow, 20)
    var N = 255
    var arr = new Float32Array(N)
    for (var i = 0; i < N; i++) {
        var x = -1 + 2 * i / (N - 1)
        if (x > 0) {
            arr[i] = mix(0, 1, x, pow)
        } else {
            arr[i] = mix(0, -1, -x, pow)
        }
    }
    return arr
}



curveCreators.fat = (num) => {
    var pow = 1 - num / 9
    pow = clamp(0.05, pow, 0.95)
    var N = 255
    var arr = new Float32Array(N)
    for (var i = 0; i < N; i++) {
        var x = -1 + 2 * i / (N - 1)
        if (x > 0) {
            arr[i] = mix(0, 1, x, pow)
        } else {
            arr[i] = mix(0, -1, -x, pow)
        }
    }
    return arr
}




function mix(a, b, t, pow) {
    return a + (b - a) * Math.pow(t, pow)
}

function clamp(min, val, max) {
    return (val < min) ? min : (val > max) ? max : val
}




