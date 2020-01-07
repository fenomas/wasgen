
import { buildSignal } from './signals'
import Enveloper from '../../../param-enveloper'

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
        applyProgram(param, { a: defaultValues.a }, info, freq)
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
    if (isNum(prog)) {
        if (type === 'freq') return { t: 0, f: prog }
        return { t: prog }
    }
    if (typeof prog !== 'object') return {}
    return prog || {}
}

function conformProperties(prog) {
    // modifiers
    cachedPropsObj.w = (prog.w > 0) ? prog.w : 0
    cachedPropsObj.t = (prog.t >= 0) ? prog.t : 1
    cachedPropsObj.f = (prog.f > 0) ? prog.f : 0
    cachedPropsObj.k = (prog.k > 0) ? prog.k : 0
    // envelope
    cachedPropsObj.a = (prog.a >= 0) ? prog.a : -1
    cachedPropsObj.h = (prog.h > 0) ? prog.h : 0
    cachedPropsObj.s = (prog.s >= 0) ? prog.s : defaultValues.s
    cachedPropsObj.d = (prog.d >= 0) ? prog.d : -1
    cachedPropsObj.r = (prog.r >= 0) ? prog.r : -1
    cachedPropsObj.z = (prog.z > 0) ? prog.z : -1
    // aliases just override default props
    if (prog.p >= 0) cachedPropsObj.s = prog.p
    if (prog.q >= 0) cachedPropsObj.d = prog.q
    return cachedPropsObj
}
var cachedPropsObj = {}












/*
 * 
 * 
 *      apply a single program element to a param
 * 
 * 
*/


function applyProgram(param, prog, info, freq) {

    // peak value (target of ramp if there is one)
    var peak = info.currValue || 1
    if (prog.t >= 0) peak *= prog.t
    peak += prog.f || 0
    if (prog.k) peak *= Math.pow(freq / 261.625, prog.k)

    // determine what kinds of scheduling will be done for this program
    var wait = (prog.w > 0)
    var ramp = (prog.a >= 0)
    var hold = (prog.h > 0)
    var sweep = (prog.d >= 0)

    // ramp is implied if needed and anything would come afterwards
    if (info.attackRampNeeded && (hold || sweep)) ramp = true

    // start envelope if we haven't
    var anything = wait || ramp || hold || sweep
    if (anything && !info.envStarted) {
        var initVal = (ramp) ? info.currValue : peak
        if (info.attackRampNeeded) initVal = 0
        enveloper.initParam(param, initVal)
        enveloper.startEnvelope(param, info.startTime)
        info.envStarted = true
        debug('- initted param:', initVal, 'time', info.startTime)
    }

    if (wait) {
        addHold(info, param, prog.w)
        debug('- wait for', prog.w)
    }

    if (ramp) {
        if (info.sweeping) addHold(info, param, 0)
        var a = (prog.a >= 0) ? prog.a : defaultValues.a
        enveloper.addRamp(param, a, peak)
        info.attackRampNeeded = false
        debug('- linear ramp to', peak, 'over', a)
    }

    if (hold) {
        addHold(info, param, prog.h)
        debug('- wait for', prog.h)
    }

    if (sweep) {
        peak *= prog.s
        var d = (prog.d > 0) ? prog.d : defaultValues.d
        enveloper.addSweep(param, -1, peak, d)
        debug('- open sweep to', peak, 'const', d)
    }

    // store the value for next program
    info.currValue = peak

    // remember release values if specified
    if (prog.r >= 0) info.releaseTime = prog.r
    if (prog.z >= 0) info.releaseTarget = info.currValue * prog.z
}

function addHold(info, param, duration) {
    enveloper.addHold(param, duration || 0)
    info.sweeping = false
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
    s: 0.5,         // env sustain
    r: 0.1,         // env release
    z: -1,          // env release target

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

