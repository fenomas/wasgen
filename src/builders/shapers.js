

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
    var numArg = parseInt(arr[2]) || 5
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


curveCreators.crush = (num) => {
    var steps = num * 2
    var N = 255
    var arr = new Float32Array(N)
    for (var i = 0; i < N; i++) {
        var x = i / (N - 1)
        var v = Math.round(x * steps) / steps
        arr[i] = -1 + 2 * v
    }
    return arr
}




