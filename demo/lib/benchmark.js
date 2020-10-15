

/*
 * 
 *      benchmark - just play a load of random sounds overlapped
 * 
*/


import { getGenerator } from './audio'

document.querySelector('#benchmark').addEventListener('click', ev => {

    var gen = getGenerator()
    var rand = (a, b) => a + (b - a) * Math.random()
    var select = function () { return arguments[Math.floor(rand(0, arguments.length))] }


    var N = 64
    // HACK!
    var mobile = /(mobile|android|iOS)/i.test(navigator.userAgent)
    if (mobile) N = 16

    gen.maxVoices(N)

    // var getType = () => select('sine', 'sq', 'tri', 'w99', 'w999', 'n0', 'n1', 'np', 'nb')
    var getType = () => 'n0'

    for (var i = 0; i < N; i++) {

        var carrier = {
            crush: 1,
            type: getType(),
            freq: [
                { p: rand(0.5, 1.5), q: 0.2 }
            ],
            gain: [
                { a: 0.1, s: 0.4, d: 0.1, r: rand(0.1, 0.4) }
            ],
        }

        var FM = {
            type: getType(),
            freq: { p: rand(0.5, 1.5), q: 0.2 },
            gain: rand(0.1, 2),
        }

        var effect = {
            type: 'highpass',
            // type: select('lowpass', 'highpass'),
            freq: { t: rand(0.5, 2) },
            Q: rand(1, 5),
        }

        carrier.freq.push(FM)
        var prog = [
            carrier,
            effect,
        ]

        var note = 65 + (30 * Math.random()) | 0
        var freq = 440 * Math.pow(2, (note - 69) / 12)
        var time = gen.now() + 0.05 + i * (1 / N)
        var releaseTime = time + 3 + Math.random()
        gen.play(prog, freq, 0.25, time, releaseTime)
    }
})



