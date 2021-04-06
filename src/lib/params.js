
import { buildSources } from './sources'
import { getCache } from './contextCache'
import Enveloper from 'param-enveloper'
// import Enveloper from '../../../param-enveloper'


var DEBUG = 0
var MIN_ATTACK_RAMP = 0.001



/*
 * 
 *
 *      outer logic to conform inputs and map them to implementations below
 * 
 * 
*/


export function applyParam(ctx, param, note, freq, time, prog, type, target, needsEnv) {
    debug('start')
    debug('PARAM: ', type, 'time', time, 'needsEnv=' + needsEnv, 'now', ctx.currentTime)

    var data = getCache(ctx)
    if (!data.paramEnveloper) data.paramEnveloper = new Enveloper(ctx)
    var enveloper = data.paramEnveloper

    // defunctionify, and handle easy case where prog is a number literal
    if (typeof prog === 'function') prog = prog()
    if (isNum(prog) && !needsEnv) {
        param.setValueAtTime(prog, 0)
        return
    }
    // otherwise arrayify
    var progList = (Array.isArray(prog)) ? prog : [prog]

    // implicit starting value for parameter
    var initValue = (type === 'freq') ? freq : 1
    if (type === 'gain' && target === 'freq') initValue = freq

    // info object that will carry through the process of scheduling param changes
    var info = {
        enveloper: enveloper,
        type: type,
        envStarted: false,
        attackRampNeeded: !!needsEnv,
        currValue: initValue,
        startTime: time,
        sweeping: false,
        releaseTime: -1,
        releaseTarget: +0,
    }

    // generate any sources needed for this param program
    var sourceNode = buildSources(ctx, note, progList, freq, time, type)

    // apply each (non-source) program in sequence, tracking state with info object
    progList.forEach(prog => {
        if (typeof prog === 'function') prog = prog()
        if (isNum(prog)) prog = (type === 'freq') ?
            { t: 0, f: prog } : { t: prog }
        if (typeof prog !== 'object') return
        if (prog.type) return // sources built already
        applyProgram(param, prog, info, freq)
    })

    // apply an attack ramp if one was needed and not applied
    if (info.attackRampNeeded) {
        debug('- default attack ramp:')
        var rampProg = { a: defaultValues.a }
        applyProgram(param, rampProg, info, freq)
    }

    if (!info.envStarted) {
        debug('- no schedules, init to:', info.currValue)
        enveloper.initParam(param, info.currValue)
    }

    // set release sweep if needed and not already applied
    if (needsEnv && info.releaseTime < 0) {
        info.releaseTime = defaultValues.r
    }

    // store info to note that will be needed when it gets released
    if (info.releaseTime >= 0) {
        note.envelopes.push({
            param: param,
            releaseTime: info.releaseTime,
            releaseTarget: info.releaseTarget,
            rootEnvelope: !!needsEnv,
        })
        debug('- stored release:', info.releaseTime, 'target', info.releaseTarget)
    }

    // store base-level frequency params for later bending, maybe
    if (type === 'freq' && (target === 'root' || target === 'freq')) {
        var mult = info.currValue / freq
        if (mult !== 0) note.bendables.push({ param, mult })
    }

    // done, return the output of any source nodes created
    info = null
    debug('end')
    return sourceNode
}



// helpers
function isNum(v) { return !isNaN(v) }

function conformEnvProperty(val, def, canBeNeg, aliasVal) {
    if (typeof aliasVal !== 'undefined') val = aliasVal
    if (typeof val === 'function') val = val()
    if (!isNum(val)) return def
    if (canBeNeg) return val
    return (val < 0) ? def : val
}









/*
 * 
 * 
 *      apply a single program element to a param
 * 
 * 
*/


function applyProgram(param, prog, info, freq) {
    // property conformance
    var w = conformEnvProperty(prog.w, 0, false)
    var a = conformEnvProperty(prog.a, -1, false)
    var h = conformEnvProperty(prog.h, -1, false)
    var s = conformEnvProperty(prog.s, 1, false, prog.p)
    var x = conformEnvProperty(prog.x, 1, false) | 0
    var k = conformEnvProperty(prog.k, 0, true)
    if (a >= 0 && a < MIN_ATTACK_RAMP) a = MIN_ATTACK_RAMP


    // force a non-zero ramp if it's needed and anything would come afterwards
    if (info.attackRampNeeded && a < 0) {
        var stuffLater = (h > 0) || (s !== 1)
        if (stuffLater) a = defaultValues.a
    }

    // baseline starting value of the param
    var paramVal = info.currValue || 1
    if (k !== 0) {
        var volKey = Math.pow(freq / 261.625, k)
        paramVal *= volKey
    }

    // repeats can't function without a wait value
    if (w === 0) x = 1

    // if we have a repeat and param change, but no ramp, imply a ramp
    if (x > 1 && a < 0) {
        if (t !== 1 || f !== 0) a = MIN_ATTACK_RAMP
    }

    // add all the necessary events, possibly multiple times
    var paramTime = info.startTime

    // rest of the variables
    var t = conformEnvProperty(prog.t, 1, false)
    var f = conformEnvProperty(prog.f, 0, true)
    var d = conformEnvProperty(prog.d, -1, false, prog.q)
    var r = conformEnvProperty(prog.r, -1, false)
    var z = conformEnvProperty(prog.z, -1, false)
    var dr = conformEnvProperty(prog.dr, -1, true)
    if (dr >= 0) { d = r = dr }
    if (d <= 0) d = defaultValues.d

    // repeat loop for applying changes
    var repeats = Math.max(x, 1)
    for (var i = 0; i < repeats; i++) {

        if (w > 0) {
            initEnvIfNeeded(info, param, paramVal)
            addHold(info, param, w)
            paramTime += w
            debug('- wait for', w)

            // if t/f will modify param, but no ramp is needed, imply one
            if ((t !== 1 || f !== 0) && (a < 0)) a = 0
        }

        // update param value
        if (i > 0) paramVal = info.enveloper.getValueAtTime(param, paramTime)
        paramVal = paramVal * t + f

        // ad-hoc special case - in repeas, make falling freqs reflect
        var reflectAt = 80
        if (info.type === 'freq' && paramVal < reflectAt && f < 0) {
            paramVal = 2 * reflectAt - paramVal
            f = -f
        }

        if (a >= 0) {
            initEnvIfNeeded(info, param, paramVal)
            if (info.sweeping) addHold(info, param, 0)
            info.enveloper.addRamp(param, a, paramVal)
            info.attackRampNeeded = false
            paramTime += a || 0
            debug('- linear ramp to', paramVal, 'over', a)
        }

        if (h > 0) {
            initEnvIfNeeded(info, param, paramVal)
            addHold(info, param, h)
            paramTime += h
            debug('- wait for', h)
        }

        if (s !== 1) {
            initEnvIfNeeded(info, param, paramVal)
            paramVal *= s
            info.enveloper.addSweep(param, -1, paramVal, d)
            info.sweeping = true
            debug('- open sweep to', paramVal, 'const', d)
        }
    }

    // store the value for next program
    info.currValue = paramVal

    // remember release values if specified
    if (r >= 0) info.releaseTime = r
    if (z >= 0) info.releaseTarget = info.currValue * z
}

function addHold(info, param, duration) {
    info.enveloper.addHold(param, duration || 0)
    info.sweeping = false
}

function initEnvIfNeeded(info, param, initialValue) {
    if (info.envStarted) return
    if (info.attackRampNeeded) initialValue = 0
    info.enveloper.initParam(param, initialValue)
    info.enveloper.startEnvelope(param, info.startTime)
    info.envStarted = true
    debug('- initted param:', initialValue, 'time', info.startTime)
}











/*
 * 
 *      default values
 * 
*/


var defaultValues = {
    // common
    w: 0,           // delay before the envelope starts
    t: 1,           // multiplies the param value
    f: 0,           // adds to the param value
    k: 0,           // volume keying

    // envelope
    a: 0.05,        // env attack
    h: 0.0,         // env hold
    d: 0.1,         // env decay
    s: 1,           // env sustain
    r: 0.1,         // env release
    z: -1,          // env release target
    x: 1,           // # of times to repeatedly apply the envelope

    // aliases
    // p -> same as s
    // q -> same as d
    // dr -> sets d+r to one value
}

















// debuggin'
var debug = (DEBUG) ? (s => {
    var depth = 0
    return function (s) {
        if (s === 'start') { depth++; return }
        if (s === 'end') { depth--; return }
        var args = Array.prototype.slice.apply(arguments)
        args.unshift(''.padEnd((depth - 1) * 4))
        console.log.apply(console, args)
    }
})() : () => { }

