'use strict'



var rand = (a, b) => a + (b - a) * Math.random()
var select = function () { return arguments[Math.floor(rand(0, arguments.length))] }





module.exports = function Presets() {

    this.jump = function () {
        return [{
            type: select('square', 'triangle'),
            freq: {
                t: 0.5,
                p: 2,
                q: rand(0.25, 0.5),
                j: [select(0.2, 0.25, 0.3333)],
                jt: [rand(0.05, 0.15)],
            },
            gain: { v: 0.5, a: 0.01, d: 0.7, s: 0, r: 0.2 }
        }]
    }


    this.coin = function () {
        var j = [select(0.2, 0.25, 0.3333)]
        var jt = [rand(0.05, 0.1)]
        if (!rand(0, 3)) {
            j.push(select(0.2, 0.25, 0.3333))
            jt.push(rand(0.15, 0.2))
        }
        return [{
            type: select('square', 'w9999'),
            freq: {
                j: j,
                jt: jt
            },
            gain: { v: 0.5, a: 0.01, d: 0.7, s: 0, r: 0.2 }
        }]
    }



    this.laser = function () {
        var bend = select(0, 1)
        return [{
            type: select('triangle'),
            freq: {
                p: bend ? select(0.5, 0.75, 0.8) : 1,
                q: bend ? rand(0.25, 0.5) : 1,
            },
            gain: { v: 0.5, a: 0.01, d: 0.7, s: 0, r: 0.2 }
        }, {
            target: '0.freq',
            freq: {
                t: 0,
                f: rand(10, 30),
                p: rand(1, 2),
                q: 0.5,
            },
            gain: { v: 0.2 },
        }]
    }




    this.explosion = function () {
        return [{
            type: 'np',
            gain: { v: 0.5, a: 0.01, d: 0.7, s: 0, r: 0.2 }
        }, {
            target: '0.gain',
            freq: {
                t: 0,
                f: rand(10, 30),
                p: rand(1, 4),
                q: rand(0.2, 0.6),
            },
            gain: { v: 0.3, a: 0, h: 0, d: 0.3, s: 0, r: 0.2 }
        }, {
            type: 'lowpass',
            freq: {
                t: 2,
                p: 0.25,
                q: rand(0.3, 0.5),
            },
        }]
    }


    this.bonk = () => [
        {
            type: 'n0',
            freq: { t: 0, f: 440 },
            gain: { v: 1, a: 0, h: 0, d: 0.02, s: 0, r: 0.02 }
        },
        { type: 'lowpass', freq: { t: 2 }, Q: 10 },
        { type: 'highpass', freq: { t: 1 / 2 }, Q: 10 },
    ]


    this.kick = () => [
        {
            type: 'sine',
            freq: { p: 0.3, q: 0.1 },
            gain: { a: 0, h: 0, s: 0, d: 0.1, r: 0.1 },
        }, {
            type: 'square',
            freq: { t: 0.5 },
            gain: { v: 0.5, a: 0, h: 0, s: 0, d: 0.02, r: 0.02 },
        },
    ]


    this.hat = () => [
        {
            type: 'n0',
            freq: { t: 0, f: 440 },
            gain: { a: 0, s: 0, h: 0, d: 0.02, r: 0.02 }
        }, {
            type: 'highpass',
            freq: { t: 10 },
        },
    ]


    this.wind = () => [
        {
            type: 'n0',
            freq: { t: 0, f: 440 },
            gain: { a: 1, h: 0, d: 0, s: 1, r: 0.5 }
        }, {
            // vibrato
            type: 'sine', target: '0.gain',
            freq: { t: 0, f: .3 },
            gain: { v:0.2, a: 1, h: 0, d: 0, s: 1, r: 0.5 }
        },
        { type: 'lowpass', Q: 10, freq: { t: 1.2 }, },
        { type: 'highpass', Q: 10, freq: { t: 0.9 }, },
    ]



    
}



