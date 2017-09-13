'use strict'


module.exports = Sources


/*
* 
*      general handler to create an audio source (oscillator / buffer)
* 
*/


function Sources(ctx) {

    var nativeTypes = {
        si: 'sine',
        sq: 'square',
        sa: 'sawtooth',
        tr: 'triangle',
    }

    this.createSource = function (type) {

        if (type[0] === 'n') {
            var src = ctx.createBufferSource()
            src.buffer = noiseBuffers[type]
            src.loop = true
            return src

        } else {

            var osc = ctx.createOscillator()
            if (type[0] === 'w') {
                osc.setPeriodicWave(getPeriodicWave(type))
            } else {
                var ctype = nativeTypes[type.substr(0, 2)]
                if (!ctype) {
                    console.warn('unknown signal type: ', type)
                    ctype = 'sine'
                }
                osc.type = ctype
            }
            return osc
        }
    }



    var periodicWaves = {}

    function getPeriodicWave(name) {
        if (!periodicWaves[name]) {
            var imag = new Float32Array(name.length)
            var real = new Float32Array(name.length)
            for (var i = 1; i < name.length; ++i) imag[i] = parseFloat(name[i])
            periodicWaves[name] = ctx.createPeriodicWave(real, imag)
        }
        return periodicWaves[name]
    }




    var noiseBuffers = (function () {
        var blen = (ctx.sampleRate / 2) | 0

        // n0 - white noise
        var n0 = ctx.createBuffer(1, blen, ctx.sampleRate)
        var dn = n0.getChannelData(0)
        for (var i = 0; i < blen; i++) {
            dn[i] = 2 * Math.random() - 1
        }

        // n1 - ??
        var n1 = ctx.createBuffer(1, blen, ctx.sampleRate)
        var dr = n1.getChannelData(0)
        for (var j = 0; j < 64; j++) {
            var r1 = Math.random() * 10 + 1
            var r2 = Math.random() * 10 + 1
            for (var k = 0; k < blen; k++) {
                var a = Math.sin((k / blen) * 2 * Math.PI * 440 * r1)
                var b = Math.sin((k / blen) * 2 * Math.PI * 440 * r2)
                dr[k] += a * b / 8
            }
        }

        return {
            n0: n0,
            n1: n1,
        }
    })()





}




