'use strict'

module.exports = {
    Signal,
    Sweep,
    Envelope,
}



function Signal(type, target, freq, gain, Q) {
    this.type = type || 'sine'
    this.target = target || ''
    this.freq = freq || null
    this.gain = gain || null
    this.Q = Q || null
}

function Sweep(t, f, p, q, k, j, jt) {
    this.t = test(t, +1)    // input multiplier
    this.f = test(f, +0)    // input adder
    this.p = test(p, +1)    // sweep multiplier
    this.q = test(q, +1)    // sweep time constant
    this.k = test(k, +0)    // volume key tracking - input is scaled by this amount
    this.j = j || ''      // array of jump multipliers
    this.jt = jt || ''    // array of jump times
}

function Envelope(v, a, h, d, s, r, k) {
    this.v = test(v, +1)     // peak
    this.a = test(a, +0.01)     // attack ramp time
    this.h = test(h, +0.01)     // hold time
    this.d = test(d, +0.2)   // decay time constant
    this.s = test(s, +0.5)   // sustain level
    this.r = test(r, +0.2)   // release time constant
    this.k = test(k, +0)     // volume key tracking - input is scaled by this amount
}


function test(val, def) {
    return (val === undefined) ? def : val
}

