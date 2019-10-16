

/*
 * 
 *      Creates web audio nodes needed for a source signal
 * 
*/

export function isNoise(type) {
    return (/^n/i.test(type))
}

var ctx

export function createSource(context, type) {
    if (ctx !== context) {
        ctx = context
        // clear cached buffers etc.
        periodicWaves = {}
        noiseBuffers = {}
    }
    // disamiguates type and defers to implementations below
    type = type.toLowerCase()
    var node
    if (type[0] === 'w') node = createWave(type)
    if (type[0] === 'n') node = createNoise(type)
    if (!node) node = createOscillator(type)
    return node
}









/*
 * 
 *      OSCILLATORS
 * 
*/


function createOscillator(type) {
    var osc = ctx.createOscillator()
    osc.type = (type[0] === 't') ? 'triangle' :
        oscillatorTypes[type.substr(0, 2)] || 'sine'
    return osc
}

var oscillatorTypes = {
    si: 'sine',
    sq: 'square',
    sa: 'sawtooth',
    tr: 'triangle',
}





/*
 * 
 *      WAVES
 * 
 *      converts 'w90909', 'w9753211', etc. into a (cached) periodicWave
 * 
*/

function createWave(type) {
    var osc = ctx.createOscillator()
    if (type.length < 2) type += '9'
    osc.setPeriodicWave(getPeriodicWave(type))
    return osc
}

function getPeriodicWave(name) {
    if (!periodicWaves[name]) {
        var imag = new Float32Array(name.length)
        var real = new Float32Array(name.length)
        for (var i = 1; i < name.length; ++i) {
            var num = parseFloat(name[i]) / 9
            imag[i] = num * num
        }
        periodicWaves[name] = ctx.createPeriodicWave(real, imag)
    }
    return periodicWaves[name]
}
var periodicWaves = {}






/*
 * 
 *      NOISE
 * 
 *      values are:
 *          'n0'  white (default)
 *          'np'  pink
 *          'n1'  metallic
 * 
*/

function createNoise(type) {
    var src = ctx.createBufferSource()
    var noiseType = 'n0'
    if (/p/.test(type)) noiseType = 'np'
    if (/1/.test(type)) noiseType = 'n1'
    if (!noiseBuffers[noiseType]) {
        noiseBuffers[noiseType] = createNoiseBuffer(noiseType)
    }
    src.buffer = noiseBuffers[noiseType]
    src.loop = true
    return src
}
var noiseBuffers = {}




function createNoiseBuffer(type) {
    var noiseLen = {
        n0: 1,
        n1: 1.5,
        np: 2,
    }[type] // seconds
    var blen = (noiseLen * ctx.sampleRate) | 0
    var buffer = ctx.createBuffer(1, blen, ctx.sampleRate)
    var data = buffer.getChannelData(0)
    if (type === 'n0') makeWhiteNoise(data)
    if (type === 'np') makePinkNoise(data)
    if (type === 'n1') makeMetallicNoise(data)
    return buffer
}

function makeWhiteNoise(data) {
    for (var i = 0; i < data.length; i++) {
        data[i] = 2 * Math.random() - 1
    }
}

function makePinkNoise(data) {
    // from: http://www.musicdsp.org/files/pink.txt
    // not sure if this is actual pink noise...
    var b0 = 0, b1 = 0, b2 = 0
    for (var i = 0; i < data.length; i++) {
        var white = 2 * Math.random() - 1
        b0 = 0.99765 * b0 + white * 0.0990460
        b1 = 0.96300 * b1 + white * 0.2965164
        b2 = 0.57000 * b2 + white * 1.0526913
        data[i] = b0 + b1 + b2 + white * 0.1848
    }
}

function makeMetallicNoise(data) {
    // pseudorandom harmonics of 440hz
    var n = hash(1)
    for (var j = 0; j < 24; j++) {
        n = hash(n)
        var a = 1 + (j % 16)
        var b = 2 + (n * 10)
        addHarmonics(data, a, b, 1 / 4)
    }
    fastSin = null // done with this now
}

var addHarmonics = (data, r1, r2, scale) => {
    var posScale = 2 * Math.PI * 440 / ctx.sampleRate
    var phase1 = Math.random() * 2 * Math.PI
    var phase2 = Math.random() * 2 * Math.PI
    for (var i = 0; i < data.length; i++) {
        var pos = i * posScale
        var a = fastSin(phase1 + r1 * pos)
        var b = fastSin(phase2 + r2 * pos)
        data[i] += a * b * scale
    }
}

function hash(n) {
    n = (n + Math.sqrt(17)) * Math.sqrt(23)
    return n - Math.floor(n)
}

var fastSin = (() => {
    var lookups = []
    var mult = 512 / (2 * Math.PI)
    for (var i = 0; i < 512; i++) lookups[i] = Math.sin(i / mult)
    // this version assumes (t >= 0) !!!
    return (t) => lookups[(t * mult) & 511]
})()
