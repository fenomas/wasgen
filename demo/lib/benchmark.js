

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
    if (/(mobile|android|iOS)/i.test(navigator.userAgent)) N = 16

    gen.maxVoices(N)


    for (var i = 0; i < N; i++) {

        var carrier = {
            type: select('sine', 'sq', 'tri', 'w99', 'w999', 'n0', 'n1', 'np'),
            freq: [],
            gain: [],
        }
        if (select(0, 1)) carrier.freq.push({ p: 1.1, q: 0.2 })
        if (select(0, 1)) carrier.gain.push({ a: 0.1, s: 0.4, r: rand(0.1, 0.4) })
        if (select(0, 1)) carrier.freq.push({ type: 'sine', freq: rand(5, 10), gain: 0.1 })

        var prog = [carrier]
        if (select(0, 1)) prog.push({
            type: select('lowpass', 'highpass'),
            freq: { t: rand(0.5, 2) },
            Q: rand(1, 5),
        })

        var note = 65 + (30 * Math.random()) | 0
        var freq = 440 * Math.pow(2, (note - 69) / 12)
        var time = gen.now() + 0.1 + i * (1 / N)
        var releaseTime = time + 0.5 + 1.5 + Math.random()
        gen.play(prog, freq, 0.25, time, releaseTime)
    }
})



