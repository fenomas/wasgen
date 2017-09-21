'use strict'

module.exports = {
    Signal,
    Sweep,
    Envelope,
    conformSignal: conformSignal,
}



function Signal(type, target, delay, freq, gain, Q) {
    this.type = type || 'sine'
    this.target = target || ''
    this.delay = delay || 0
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
    this.j = j || null      // array of jump multipliers
    this.jt = jt || null    // array of jump times
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




/*
 * 
 *  Helper - conform any random input values into a valid program
 * 
*/

function conformSignal(raw) {
    var sig = new Signal()
    if (raw.type) sig.type = '' + raw.type
    if (raw.target) sig.target = '' + raw.target
    if (raw.delay) sig.delay = +raw.delay
    sig.freq = conformParam(raw.freq, emptyFreq)
    sig.gain = conformParam(raw.gain, emptyGain)
    sig.Q = conformParam(raw.Q, null)
    return sig
}

var emptyFreq = new Sweep()
var emptyGain = new Envelope()

function conformParam(raw, nullCase) {
    if (typeof raw === 'number') return { t: 0, f: +raw, p: 1 }
    if (!raw) return nullCase
    if (Object.keys(raw).length === 0) return nullCase
    if (raw.t || raw.f || raw.j || raw.p) {
        // raw is a sweep
        var sw = new Sweep(raw.t, raw.f, raw.p, raw.q, raw.k)
        if (raw.j && raw.jt) {
            sw.j = (typeof raw.j === 'string') ? strToArr(raw.j) : raw.j
            sw.jt = (typeof raw.jt === 'string') ? strToArr(raw.jt) : raw.jt
        }
        return sw
    } else {
        // raw is an envelope
        return new Envelope(raw.v, raw.a, raw.h, raw.d, raw.s, raw.r, raw.k)
    }
}


function strToArr(s) {
    return s.split(',').map(parseFloat)
}



