




var rand = (a, b) => a + (b - a) * Math.random()
var select = function () { return arguments[Math.floor(rand(0, arguments.length))] }


export var effectPrograms = {

    jump: function () {
        var type = select('square', 'triangle', 'w9999')
        var t = (type === 'square') ? 0.1 : 0.3
        var freq = [
            { t: 0.5, p: 2, q: rand(0.4, 0.6) },
        ]
        var sweepLen = freq[0].q
        if (select(0, 1)) {
            var w = rand(0.05, 0.15)
            freq.push({ w: w, t: 0.5, a: 0.01 })
            freq.push({ p: 2, q: rand(0.2, 0.5) })
            sweepLen += freq[2].q
        }
        return {
            type,
            freq,
            gain: { t: t, a: 0.01, d: sweepLen / 2, s: 0, r: 0.15 }
        }
    },



    coin: function () {
        var freq = [
            { w: rand(0.05, 0.1), p: rand(1.1, 1.5), q: 0.01 },
        ]
        if (select(0, 1)) freq.push({
            w: rand(0.05, 0.1), p: rand(1.1, 1.2), q: 0.01,
        })
        var type = select('square', 'triangle', 'w9999', 'saw')
        var t = (type === 'square') ? 0.1 : 0.3
        return {
            type, freq,
            gain: { t: t, a: 0.01, s: 0, d: 0.5, r: 0.1 }
        }
    },



    laser: function () {
        var freq = []
        if (select(0, 1)) freq.push({
            w: rand(0, 0.2),
            p: select(0.5, 0.75, 0.8),
            q: rand(0.25, 0.5),
        })
        // tremolo
        freq.push({
            type: 'sine',
            freq: [
                rand(5, 20),
                { p: rand(1, 2), q: 0.5 }
            ],
            gain: { t: rand(0.05, 0.3) },
        })
        return [{
            type: select('triangle', 'sine', 'w999', 'w99999'),
            freq,
            gain: { t: 0.3, a: 0.01, d: 0.3, s: 0, r: 0.15 }
        }]
    },




    explosion: function () {
        return [{
            type: 'np',
            gain: [
                { t: 0.4, a: 0.01, d: 0.7, s: 0, r: 0.2 },
                {
                    type: 'sine',
                    freq: { t: 0, f: rand(10, 30), p: rand(1, 4), q: rand(0.2, 0.6) },
                    gain: { t: 0.1, d: 0.5, s: 0, r: 0.2 },
                }
            ]
        }, {
            type: 'lowpass',
            freq: {
                t: rand(1.5, 4),
                p: rand(0.1, 0.3),
                q: rand(0.2, 0.6),
            },
            effect: 'crush-' + (rand(2, 8)) | 0,
        }]
    },




    bonk: () => [
        {
            type: 'n0',
            gain: { t: 0.4, a: 0.005, s: 0, dr: 0.02, k: -0.5 }
        },
        { type: 'lowpass', freq: { t: rand(1.5, 5) }, Q: rand(2, 15) },
        { type: 'highpass', freq: { t: rand(0.2, 0.8) }, Q: rand(2, 15) },
    ],




    kick: () => [
        {
            type: 'sine',
            freq: { p: 0.3, q: 0.1 },
            gain: { t: 0.3, a: 0, h: 0, s: 0, d: 0.1, r: 0.1 },
        }, {
            type: 'square',
            freq: { t: 0.5 },
            gain: { t: 0.1, a: 0, h: 0, s: 0, d: 0.05, r: 0.03 },
        },
    ],




    hihat: () => [
        {
            type: 'n1',
            freq: select({}, { t: 0, f: rand(440, 880) }),
            gain: { t: 0.3, a: 0, s: 0, h: 0, d: rand(0.02, 0.1), r: 0.05 }
        }, {
            type: 'highpass',
            freq: { t: 2 },
            Q: 5,
        },
    ],




    wind: () => [
        {
            type: 'n0',
            gain: { t: 0.2, a: 1, h: 0, d: 0, s: 1, r: 0.5 },
        }, {
            type: 'lowpass',
            Q: rand(1, 10),
            freq: [
                { t: 1.3 },
                { type: 'sine', freq: 0.25, gain: 0.2 }
            ],
        }, {
            type: 'highpass',
            Q: rand(1, 10),
            freq: [
                { t: 0.8 },
                { type: 'sine', freq: 0.21, gain: 0.2 }
            ],
        },
    ],




}



