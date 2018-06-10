'use strict'


module.exports = Sources


/*
 * 
 *      general handler to create an audio source (oscillator / buffer)
 * 
*/


function Sources(ctx) {

    var oscillatorTypes = {
        si: 'sine',
        sq: 'square',
        sa: 'sawtooth',
        tr: 'triangle',
    }

    var noiseTypes = {
        n0: 'n0',
        n1: 'n1',
        np: 'np',
    }




    // info accessors

    this.usesGain = function (node) { return true }
    this.usesQ = function (node) { return false }



    // source creation

    this.createNode = function (type) {
        var ty = type.substr(0, 2)
        if (noiseTypes[ty]) return createNoise(noiseTypes[ty])
        var t = type[0]
        if (t === 'w') return createWave(type)

        if (oscillatorTypes[ty]) return createOscillator(oscillatorTypes[ty])
        if (t === 'n') return createNoise('n0')
        if (t === 't') return createOscillator('triangle')
        return createOscillator('sine')
    }




    /*
     * 
     *      SOURCES
     * 
    */


    function createOscillator(type) {
        var osc = ctx.createOscillator()
        osc.type = type
        return osc
    }

    function createWave(type) {
        var osc = ctx.createOscillator()
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
    */

    function createNoise(type) {
        var src = ctx.createBufferSource()
        src.buffer = noiseBuffers[type] || noiseBuffers.n0
        src.loop = true
        return src
    }

    var noiseBuffers = {}
    var blen = (ctx.sampleRate) | 0

    // n0 - white noise
    noiseBuffers.n0 = (function () {
        var n0 = ctx.createBuffer(1, blen, ctx.sampleRate)
        var dn = n0.getChannelData(0)
        for (var i = 0; i < blen; i++) {
            dn[i] = 2 * Math.random() - 1
        }
        return n0
    })()


    // n1 - random harmonics of 440hz
    noiseBuffers.n1 = (function () {
        var n1 = ctx.createBuffer(1, blen, ctx.sampleRate)
        var dr = n1.getChannelData(0)

        for (var j = 0; j < 64; j++) {
            var r1 = (Math.random() * 10 + 1) * 440 * Math.PI * 2
            var r2 = (Math.random() * 10 + 1) * 440 * Math.PI * 2
            var p1 = Math.random() * 2 * Math.PI
            var p2 = Math.random() * 2 * Math.PI
            for (var i = 0; i < blen; i++) {
                var a = Math.sin(p1 + r1 * (i / blen))
                var b = Math.sin(p2 + r2 * (i / blen))
                dr[i] += a * b / 8
            }
        }
        return n1
    })()


    // np - pink noise
    // http://www.musicdsp.org/files/pink.txt
    noiseBuffers.np = (function () {
        var np = ctx.createBuffer(1, blen, ctx.sampleRate)
        var dn = np.getChannelData(0)
        var b0 = 0, b1 = 0, b2 = 0

        for (var i = 0; i < blen; i++) {
            var white = 2 * Math.random() - 1
            b0 = 0.99765 * b0 + white * 0.0990460
            b1 = 0.96300 * b1 + white * 0.2965164
            b2 = 0.57000 * b2 + white * 1.0526913
            dn[i] = b0 + b1 + b2 + white * 0.1848
        }
        return np
    })()



}

