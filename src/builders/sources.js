

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
    if (type[0] === 'p') node = createPulse(type)
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
 *      PULSES
 * 
 *      converts 'p25' into a 25% duty pulse wave, etc
 *      ref: https://github.com/pendragon-andyh/WebAudio-PulseOscillator
*/

function createPulse(type) {
    var duty = Math.round(parseInt(type.substr(1)) || 50)
    duty = Math.min(Math.max(duty, 1), 99)
    var osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    var shaper = ctx.createWaveShaper()
    shaper.curve = makePulseCurve(duty)
    osc.connect(shaper)
    // return a fake wrapper that looks like an oscillator
    return {
        start: t => osc.start(t),
        frequency: osc.frequency,
        connect: node => shaper.connect(node),
        disconnect: () => {
            // treat as dispose
            shaper.disconnect()
            osc.disconnect()
            osc.stop()
        },
        input: osc,
    }
}

function makePulseCurve(duty) {
    var N = 256
    if (curves[duty]) return curves[duty]
    var curve = new Float32Array(N)
    var cutoff = N * duty / 100
    for (var i = 0; i < N; i++) {
        curve[i] = (i < cutoff) ? 1 : -1
    }
    return curves[duty] = curve
}
var curves = {}




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
 *          'nb'  brown
 *          'n1'  metallic
 * 
*/

function createNoise(type) {
    var src = ctx.createBufferSource()
    var noiseType = noiseTypes[type] || 'n0'
    if (!noiseBuffers[noiseType]) {
        noiseBuffers[noiseType] = createNoiseBuffer(noiseType)
    }
    src.buffer = noiseBuffers[noiseType]
    src.loop = true
    return src
}
var noiseTypes = {
    n0: 'n0',
    n1: 'n1',
    np: 'np',
    nb: 'nb',
}
var noiseBuffers = {}




function createNoiseBuffer(type) {
    var noiseLen = {
        n0: 1,
        n1: 1.5,
        nb: 1.5,
        np: 1.5,
    }[type] // seconds
    var blen = (noiseLen * ctx.sampleRate) | 0
    var buffer = ctx.createBuffer(1, blen, ctx.sampleRate)
    var data = buffer.getChannelData(0)
    if (type === 'n0') makeWhiteNoise(data)
    if (type === 'nb') makeBrownNoise(data)
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
    // Paul Kellet's algorithm, from:
    // http://www.firstpr.com.au/dsp/pink-noise/
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    var max = 0
    data.forEach((v, i) => {
        var white = 2 * Math.random() - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        b6 = white * 0.115926
        max = Math.max(max, Math.abs(data[i]))
    })
    data.forEach((v, i) => { data[i] /= max })
}

function makeBrownNoise(data) {
    var a = 0, max = 0
    for (var i = 0; i < data.length; i++) {
        var white = 2 * Math.random() - 1
        a = (a + white * 0.02) / 1.02
        max = Math.max(max, Math.abs(a))
        data[i] = a
    }
    data.forEach((v, i) => { data[i] /= max })
}

function makeMetallicNoise(data) {
    // pseudorandom harmonics of 440hz
    var n = hash(1)
    var max = 0
    for (var j = 0; j < 24; j++) {
        n = hash(n)
        var a = 1 + (j % 16)
        var b = 2 + (n * 10)
        var peak = addHarmonics(data, a, b, 1 / 4)
        max = Math.max(max, peak)
    }
    data.forEach((v, i) => { data[i] /= max })
}






// helpers

var addHarmonics = (data, r1, r2, scale) => {
    var max = 0
    var posScale = 2 * Math.PI * 440 / ctx.sampleRate
    var phase1 = Math.random() * 2 * Math.PI
    var phase2 = Math.random() * 2 * Math.PI
    for (var i = 0; i < data.length; i++) {
        var pos = i * posScale
        var a = fastSin(phase1 + r1 * pos)
        var b = fastSin(phase2 + r2 * pos)
        data[i] += a * b * scale
        max = Math.max(max, Math.abs(data[i]))
    }
    return max
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
