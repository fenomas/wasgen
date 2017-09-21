'use strict'

var defs = require('../src/progDefs')

var Signal = defs.Signal
var Sweep = defs.Sweep
var Envelope = defs.Envelope

module.exports = function programConverter(tsProg) {

    // tinysynth defaults
    var defp = { g: 0, w: "sine", t: 1, f: 0, v: 0.5, a: 0, h: 0.01, d: 0.01, s: 0, r: 0.05, p: 1, q: 1, k: 0 };

    return tsProg.map(pn => {
        var sig = {}
        for (var s in defp) sig[s] = defp[s]
        for (var s2 in pn) sig[s2] = pn[s2]

        // remove clicks :/
        if (sig.a < 0.003) sig.a = 0.003

        // always a sweep for frequency, always an envelope for gain
        var freq = new Sweep(sig.t, sig.f, sig.p, sig.q)
        var gain = new Envelope(sig.v, sig.a, sig.h, sig.d, sig.s, sig.r, sig.k)
        // target based on g property
        var target = ''
        if (sig.g > 10) target = (sig.g - 11) + '.gain'
        else if (sig.g > 0) target = (sig.g - 1) + '.freq'
        // finally one signal per array input
        return new Signal(sig.w, target, 0, freq, gain)
    })

}

