'use strict'

var defs = require('../progDefs')

module.exports = Params


/*
* 
*      general handler to apply a program object to an AudioParam
* 
*/


function Params() {



    this.apply = function (note, param, time, baseVal, program, inputFreq) {

        // apply input key tracking before subsequent param programs
        if (program.k) {
            baseVal *= Math.pow(inputFreq / 261.625, program.k)
            // equivalent to: base *= Math.pow(2, (midiNote - 60) / 12 * k)
        }

        // apply sweep or envelope - sweep always has one of [t, f, p, j] nonzero
        if (program.t || program.f || program.p || program.j) {
            return applyParamSweep(param, time, baseVal, program)
        } else {
            return applyParamEnvelope(note, param, time, baseVal, program)
        }

    }




    // apply a sweep program
    function applyParamSweep(param, time, value, prog) {
        value = clamp(value * prog.t + prog.f)
        param.setValueAtTime(value, time)

        var bend = (prog.p !== 1)
        var target = clamp(value * prog.p)
        if (bend) param.setTargetAtTime(target, time, prog.q)

        // console.log('   param sweep:', value, bend ? ' --> ' + target : '')

        if (prog.j && prog.jt) {
            var jarr = prog.j
            var jtarr = prog.jt
            if (typeof jarr === 'string') jarr = jarr.split(',').map(s => parseFloat(s))
            if (typeof jtarr === 'string') jtarr = jtarr.split(',').map(s => parseFloat(s))
            var v = value
            var t = 0
            for (var i = 0; i < jarr.length; i++) {
                var j = jarr[i]
                var jt = jtarr[i]
                var old = v
                if (j && jt) {
                    if (bend) {
                        v = evalTargetCurve(v, target, jt, prog.q)
                        old = v
                        v += clamp(j * (target - v))
                        t += jt
                        param.setValueAtTime(v, time + t)
                        param.setTargetAtTime(target, time + t, prog.q)
                    } else {
                        v += clamp(v * j)
                        t += jt
                        param.setValueAtTime(v, time + t)
                    }
                    // console.log('   param jump:', old, 'to', v, bend ? ' --> ' + target : '')
                }
            }
        }
        return value
    }

    // evaluate value of param during a setTarget curve
    // https://webaudio.github.io/web-audio-api/#widl-AudioParam-setTargetAtTime-AudioParam-float-target-double-startTime-float-timeConstant
    function evalTargetCurve(v0, vTarget, dt, timeConst) {
        return vTarget + (v0 - vTarget) * Math.exp(-dt / timeConst)
    }




    // apply an envelope program
    function applyParamEnvelope(note, param, time, peak, prog) {
        param.value = 0
        param.setValueAtTime(0, 0)

        peak = clamp(peak * prog.v)

        if (prog.a > 0) {
            param.setValueAtTime(0, time)
            param.linearRampToValueAtTime(peak, time + prog.a)
        } else {
            param.setValueAtTime(peak, time)
        }
        if (prog.s !== 1) {
            var decayTime = time + prog.a + prog.h
            var sustain = clamp(peak * prog.s)
            param.setTargetAtTime(sustain, decayTime, prog.d)
        }
        // store values in the note object so that stuff can be done at release time
        note.envParams.push(param)
        note.envAttacks.push(prog.a || 0)
        note.envPeaks.push(peak)
        note.envReleases.push(prog.r || 0)

        // console.log(`   param env: 0  (${prog.a})=> ${peak}   (${prog.h})=> ${peak * prog.s}   (${prog.r})=> 0`)

        return peak
    }




    function clamp(val) {
        return (val > 22050) ? 22050 : val
    }

}



