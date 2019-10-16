




var rand = (a, b) => a + (b - a) * Math.random()
var select = function () { return arguments[Math.floor(rand(0, arguments.length))] }


export var effectPrograms = {

    jump: function () {
        var type = select('square', 'triangle', 'w9999')
        var t = (type === 'square') ? 0.4 : 0.8
        var freq = [
            { t: 0.5, p: 2, q: rand(0.4, 0.6) },
        ]
        if (select(0, 1)) {
            var w = rand(0.05, 0.25)
            freq.push({ w: w, p: 1.5, q: 0.001 })
            freq.push({ w: w + 0.02, p: 2, q: rand(0.2, 0.6) })
        }
        return [{
            type,
            freq,
            gain: { t: t, a: 0.01, d: 0.7, s: 0, r: 0.2 }
        }]
    },



    coin: function () {
        var freq = [
            { w: rand(0.05, 0.15), p: rand(1.1, 1.5), q: 0.01 },
        ]
        if (select(0, 1)) freq.push({
            w: rand(0.05, 0.25), p: rand(0.7, 1.5), q: 0.01,
        })
        return [{
            type: select('square', 'triangle', 'w9999', 'saw'),
            freq,
            gain: { t: 0.5, a: 0.01, d: 0.7, s: 0, r: 0.2 }
        }]
    },



    laser: function () {
        var freq = []
        if (select(0, 1)) freq.push(
            { p: select(0.5, 0.75, 0.8), q: rand(0.25, 0.5), }
        )
        // tremolo
        freq.push({
            type: 'sine',
            freq: { t: 0, f: rand(5, 30), p: rand(1, 2), q: 0.5 },
            gain: rand(0.1, 0.3),
        })
        return [{
            type: select('triangle', 'sine', 'w999', 'w99999'),
            freq,
            gain: { t: 0.5, a: 0.01, d: 0.7, s: 0, r: 0.2 }
        }]
    },




    explosion: function () {
        return [{
            type: 'np',
            gain: [
                { t: 0.5, a: 0.01, d: 0.7, s: 0, r: 0.2 },
                {
                    type: 'sine',
                    freq: { t: 0, f: rand(10, 30), p: rand(1, 4), q: rand(0.2, 0.6) },
                    gain: { t: 0.3, a: 0, h: 0, d: 0.3, s: 0, r: 0.2 },
                }
            ]
        }, {
            type: 'lowpass',
            freq: {
                t: rand(1.5, 4),
                p: rand(0.1, 0.3),
                q: rand(0.2, 0.6),
            },
        }]
    },




    bonk: () => [
        {
            type: 'n0',
            gain: { a: 0, d: 0.05, s: 0, r: 0.02 }
        },
        { type: 'lowpass', freq: { t: 2 }, Q: 10 },
        { type: 'highpass', freq: { t: 0.5 }, Q: 10 },
    ],




    kick: () => [
        {
            type: 'sine',
            freq: { p: 0.3, q: 0.1 },
            gain: { a: 0, h: 0, s: 0, d: 0.1, r: 0.1 },
        }, {
            type: 'square',
            freq: { t: 0.5 },
            gain: { t: 0.25, a: 0, h: 0, s: 0, d: 0.05, r: 0.02 },
        },
    ],




    hihat: () => [
        {
            type: 'n1',
            freq: select({}, { t: 0, f: rand(440, 880) }),
            gain: { a: 0, s: 0, h: 0, d: rand(0.02, 0.1), r: 0.05 }
        }, {
            type: 'highpass',
            freq: { t: 2 },
            Q: 5,
        },
    ],




    wind: () => [
        {
            type: 'n0',
            gain: { a: 1, h: 0, d: 0, s: 1, r: 0.5 },
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



