
import { buildSignal } from './signals'

var DEBUG = 0



/*
 * 
 *
 *      outer logic to conform inputs and map them to implementations below
 * 
 * 
*/

export function buildParam(ctx, param, note, freq, time, prog, type, target, needsEnv) {
    debug('start')
    debug('PARAM: ', type, 'time', time, 'for prog', prog)

    // info to track about this param and program
    var info = {
        needsEnvelope: needsEnv,
        initializedValue: false,
        appliedEnvelope: false,
        envData: {
            param: param,
            ramps: [],
            r: -1,
            z: 0,
        },
    }

    // special case for the chain of gain nodes leading to a top level source
    // such params must have an implicit 0..N..0 envelope
    if (info.needsEnvelope) {
        debug('implicit t=0 value of 0')
        param.setValueAtTime(0, 0)
        info.initializedValue = true
    }

    // implied baseline value that programs affect
    var baseValue = (type === 'freq') ? freq : 1
    if (type === 'gain' && target === 'freq') baseValue = freq

    // run through all program inputs
    // applying each program to param, and maybe updating baseValue
    var progs = (Array.isArray(prog)) ? prog : [prog]
    progs.forEach(prog => {
        prog = conformProgram(prog, type)
        if (prog.type) {
            // for source program, recurse to signal builder and exit
            var signalNode = buildSignal(ctx, note, prog, freq, time, type, needsEnv)
            signalNode.connect(param)
        } else {
            // otherwise schedule values and track baseValue
            baseValue = applyProgram(param, prog, info, freq, time, baseValue)
        }
    })

    // finish implicit envelope if none was applied otherwise
    if (info.needsEnvelope && !info.appliedEnvelope) {
        debug('- applying implicit envelope:')
        var envProg = { a: defaultValues.a }
        applyProgram(param, envProg, info, freq, time, baseValue)
    }

    // set a t=0 value if nothing else did so
    if (!info.initializedValue) {
        debug('- implicit t=0 value after program: ', baseValue)
        param.setValueAtTime(baseValue, 0)
        info.initializedValue = true
    }

    // store param envelope info if necessary
    var env = info.envData
    if ((env.ramps.length > 0) || (env.r >= 0)) {
        note.envelopes.push(env)
    }

    // store base-level frequency params for later bending, maybe
    if (type === 'freq' && (!target || target === 'freq')) {
        var mult = baseValue / freq
        if (mult !== 0) note.bendables.push({ param, mult })
    }

    // done
    info.envData = null
    info = null
    debug('end')
}

function isNum(v) { return !isNaN(v) }

function conformProgram(prog, type) {
    if (!isNaN(prog)) {
        if (type === 'freq') return { t: 0, f: prog }
        return { t: prog }
    }
    if (typeof prog !== 'object') return {}
    return prog
}









/*
 * 
 *      apply a single program element to a param
 * 
*/



function applyProgram(param, prog, info, freq, time, baseValue) {

    // otherwise treat program as a collection of numeric values
    var props = Object.assign({}, defaultValues, prog)
    time += props.w
    var localValue = baseValue * props.t + props.f
    if (props.k !== 0) localValue *= Math.pow(freq / 261.625, props.k)

    // sweep-like program - anything with a 'p'
    var sweepLike = (props.p !== 1)
    if (sweepLike) {
        if (!info.initializedValue) {
            param.setValueAtTime(localValue, 0)
            debug('- sweep init', localValue, 'time=0')
            info.initializedValue = true
        }
        var target = localValue * props.p
        param.setTargetAtTime(target, time, props.q)
        debug('- sweep target', localValue, 'time', time)
    }

    // env-like program
    var envLike = isNum(prog.a) || isNum(prog.d) || isNum(prog.s) || isNum(prog.r) || isNum(prog.h)
    if (envLike) {
        debug('- starting env, base', baseValue, 'local', localValue)

        // envelopes assumed to start from 0
        var start = 0
        var peak = localValue

        // init if nothing else has already
        if (!info.initializedValue) {
            param.setValueAtTime(start, 0)
            info.initializedValue = true
            debug('- env t=0 value: ', start)
        }

        // attack
        if (start !== peak) {
            var t0 = time
            var t1 = time + Math.max(props.a, 0.003)
            param.setValueAtTime(start, t0)
            param.linearRampToValueAtTime(peak, t1)
            debug('- env ramp: ', start, 'to', peak, 'times', t0, 'to', t1)
            // store ramp info
            info.envData.ramps.push({
                v0: start,
                v1: peak,
                t0: t0,
                t1: t1,
            })
            time = t1
            localValue = peak
        }

        // hold and decay
        if (props.s !== 1) {
            time += props.h
            var sustain = peak * props.s
            param.setTargetAtTime(sustain, time, props.d)
            debug('- env decay to', sustain, 'time', time)
        }

        // store release value only if explicitly in the program
        // or if note requires one (due to being part of gain chain to output)
        if (info.needsEnvelope || isNum(prog.r)) {
            info.envData.r = props.r
            // program can optionally set an explict release target
            if (isNum(prog.z)) info.envData.z = prog.z
            debug('- env stored release val', props.r)
        }

        info.appliedEnvelope = true
    }


    if (!(sweepLike || envLike)) {
        debug('- prog with no params applied, val => ', localValue)
    }

    return localValue
}










/*
 * 
 *      default values and getters for same
 * 
*/

var defaultValues = {
    // common
    w: 0,           // delay before start
    t: 1,           // multiplier for start/peak
    f: 0,           // add to start/peak
    k: 0,           // vol keying

    // sweep
    p: 1,           // sweep to peak *= p
    q: 0.1,         // time constant of sweep

    // envelope
    a: 0.05,        // env attack
    h: 0.0,         // env hold
    d: 0.1,         // env delay
    s: 0.8,         // env sustain
    r: 0.1,         // env release
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

