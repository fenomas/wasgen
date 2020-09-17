
import { buildSignal } from './signals'
import Enveloper from 'param-enveloper'
// import Enveloper from '../../../param-enveloper'


var DEBUG = 0



/*
 * 
 *
 *      outer logic to conform inputs and map them to implementations below
 * 
 * 
*/


var enveloper

export function buildParam(ctx, param, note, freq, time, prog, type, target, needsEnv) {
    debug('start')
    debug('PARAM: ', type, 'time', time, 'needsEnv=' + needsEnv, 'now', ctx.currentTime)

    if (!enveloper) enveloper = new Enveloper(ctx)

    // implicit starting value for parameter
    var initValue = (type === 'freq') ? freq : 1
    if (type === 'gain' && target === 'freq') initValue = freq

    // info object that will carry through the process of scheduling param changes
    var info = {
        type: type,
        envStarted: false,
        attackRampNeeded: !!needsEnv,
        currValue: initValue,
        startTime: time,
        sweeping: false,
        releaseTime: -1,
        releaseTarget: +0,
    }

    // apply each program entry in turn, tracking state with info object
    var progs = (Array.isArray(prog)) ? prog : [prog]
    if (progs.length === 0) progs.push({})
    progs.forEach(prog => {
        prog = conformProgram(prog, type)
        if (prog.type) {
            // source programs recurse to the parent signal creator
            var signalNode = buildSignal(ctx, note, prog, freq, time, type, false)
            signalNode.connect(param)
        } else {
            var cleanProg = conformProperties(prog)
            applyProgram(param, cleanProg, info, freq)
        }
    })

    // apply an attack ramp if one was needed and not applied
    if (info.attackRampNeeded) {
        debug('- default attack ramp:')
        var rampProg = conformProperties({ a: defaultValues.a })
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
    if (type === 'freq' && (!target || target === 'freq')) {
        var mult = info.currValue / freq
        if (mult !== 0) note.bendables.push({ param, mult })
    }

    // done
    info = null
    debug('end')
}


function isNum(v) { return (typeof v === 'number') }

function conformProgram(prog, type) {
    if (typeof prog === 'function') prog = prog()
    if (isNum(prog)) {
        if (type === 'freq') return { t: 0, f: prog }
        return { t: prog }
    }
    if (typeof prog !== 'object') return {}
    return prog || {}
}

function conformProperties(prog) {
    // apply all defined properties to a reused cache object
    conformSingleProp(cachedPropsObj, prog, 'w', 0)
    conformSingleProp(cachedPropsObj, prog, 't', 1)
    conformSingleProp(cachedPropsObj, prog, 'f', 0)
    conformSingleProp(cachedPropsObj, prog, 'k', 0)
    // same for envelope values
    conformSingleProp(cachedPropsObj, prog, 'a', -1)
    conformSingleProp(cachedPropsObj, prog, 'h', -1)
    conformSingleProp(cachedPropsObj, prog, 's', 1)
    conformSingleProp(cachedPropsObj, prog, 'd', -1)
    conformSingleProp(cachedPropsObj, prog, 'r', -1)
    conformSingleProp(cachedPropsObj, prog, 'z', -1)
    conformSingleProp(cachedPropsObj, prog, 'x', -1)
    // p/q aliases just override s/d props
    if (isNum(prog.p)) cachedPropsObj.s = prog.p
    if (isNum(prog.q)) cachedPropsObj.d = prog.q
    return cachedPropsObj
}
var cachedPropsObj = {}

function conformSingleProp(tgt, src, prop, def) {
    var val = src[prop]
    if (typeof val === 'function') val = val()
    tgt[prop] = (isNum(val)) ? val : def
}










/*
 * 
 * 
 *      apply a single program element to a param
 * 
 * 
*/


function applyProgram(param, prog, info, freq) {

    // determine what kinds of scheduling will be done for this program
    var wait = (prog.w > 0)
    var ramp = (prog.a >= 0)
    var hold = (prog.h > 0)
    var sweep = (prog.s !== 1)
    var repeats = Math.max(prog.x | 0, 1)
    var volKey = (prog.k) ? Math.pow(freq / 261.625, prog.k) : 1

    // force a non-zero ramp if it's needed and anything would come afterwards
    if (info.attackRampNeeded && (hold || sweep)) {
        ramp = true
        if (prog.a <= 0) prog.a = defaultValues.a
    }

    // baseline starting value of the param
    var paramVal = info.currValue || 1
    paramVal *= volKey

    // repeats can't function without a wait value
    if (!wait) repeats = 1

    // add all the necessary events, possibly multiple times
    var paramTime = info.startTime

    for (var i = 0; i < repeats; i++) {

        if (wait) {
            initEnvIfNeeded(info, param, paramVal)
            addHold(info, param, prog.w)
            paramTime += prog.w
            debug('- wait for', prog.w)
        }

        // update param value
        if (i > 0) paramVal = enveloper.getValueAtTime(param, paramTime)
        paramVal = paramVal * prog.t + prog.f

        // ad-hoc special case - make low/falling frequencies reflect around 50hz 
        if (info.type === 'freq' && paramVal < 50 && prog.f < 0) {
            paramVal = 100 - paramVal
            prog.f = -prog.f
        }

        if (ramp) {
            initEnvIfNeeded(info, param, paramVal)
            if (info.sweeping) addHold(info, param, 0)
            enveloper.addRamp(param, prog.a, paramVal)
            info.attackRampNeeded = false
            paramTime += prog.a || 0
            debug('- linear ramp to', paramVal, 'over', prog.a)
        }

        if (hold) {
            initEnvIfNeeded(info, param, paramVal)
            addHold(info, param, prog.h)
            paramTime += prog.h || 0
            debug('- wait for', prog.h)
        }

        if (sweep) {
            initEnvIfNeeded(info, param, paramVal)
            paramVal *= prog.s
            var d = (prog.d > 0) ? prog.d : defaultValues.d
            enveloper.addSweep(param, -1, paramVal, d)
            info.sweeping = true
            debug('- open sweep to', paramVal, 'const', d)
        }
    }

    // store the value for next program
    info.currValue = paramVal

    // remember release values if specified
    if (prog.r >= 0) info.releaseTime = prog.r
    if (prog.z >= 0) info.releaseTarget = info.currValue * prog.z
}

function addHold(info, param, duration) {
    enveloper.addHold(param, duration || 0)
    info.sweeping = false
}

function initEnvIfNeeded(info, param, initialValue) {
    if (info.envStarted) return
    if (info.attackRampNeeded) initialValue = 0
    enveloper.initParam(param, initialValue)
    enveloper.startEnvelope(param, info.startTime)
    info.envStarted = true
    debug('- initted param:', initialValue, 'time', info.startTime)
}











/*
 * 
 *      default values and getters for same
 * 
*/

var defaultValues = {
    // common
    w: 0,           // delay before start
    t: 1,           // multiplier for param value
    f: 0,           // added to param value
    k: 0,           // vol keying

    // envelope
    a: 0.05,        // env attack
    h: 0.0,         // env hold
    d: 0.1,         // env delay
    s: 1,           // env sustain
    r: 0.1,         // env release
    z: -1,          // env release target
    x: 1,           // # of times to repeatedly apply the envelope

    // aliases
    // p -> same as s
    // q -> same as d
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

