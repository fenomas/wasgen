// @ts-check

import { pingAutoPlay } from "./controls"


/*
 * 
 *      initial settings
 * 
*/


/** @type {any} */
export var currentProgram = [{}]
var programStr = ''








/*
 * 
 *      'presets' and 'effects' pulldowns
 * 
*/

import { Instruments } from '../external/tinySynthInstruments'
import { effectPrograms } from './effectPrograms'
var instruments = new Instruments()
var presetsPD = document.querySelector('#presets')
var effectsPD = document.querySelector('#effects')
var redoEffect = document.querySelector('#redoEffect')

// populate the pulldown menus
var addEl = (menu, name) => {
    var opt = document.createElement('option')
    opt.text = name
    menu.options[menu.options.length] = opt
}
Object.keys(effectPrograms).forEach(name => addEl(effectsPD, name))
instruments.names.forEach(name => addEl(presetsPD, name))

// events
function setProgram(ev) {
    var name = ev.target.selectedOptions[0].text
    var getter = effectPrograms[name]
    var prog = (getter) ? getter() : convertTinySynthProgram(name)
    currentProgram = prog
    textEl.value = programToString(currentProgram)
    pingAutoPlay(true)
}
if (presetsPD) presetsPD.addEventListener('change', ev => setProgram(ev))
if (effectsPD) effectsPD.addEventListener('change', ev => setProgram(ev))
if (redoEffect) redoEffect.addEventListener('click', ev => setProgram({ target: effectsPD }))


// intial state - presets [0]
currentProgram = convertTinySynthProgram(instruments.names[0])
// currentProgram = [{
//     type: 'sine',
//     freq: { r: 1, z: 0.5 },
//     gain: { a: 1, h: 1, d: 1, s: 0.2, r: 1 },
// }]
programStr = programToString(currentProgram)












/*
 * 
 *      program text field
 * 
*/

/** @type {any} */
var textEl = document.querySelector('#progText')
textEl.value = programStr
textEl.addEventListener('input', ev => {
    var newProg = stringToProgram(ev.target['value'])
    textEl.style.backgroundColor = (newProg) ? '' : '#fdd'
    if (newProg) {
        pingAutoPlay(true)
        currentProgram = newProg
    }
})









/*
 * 
 *      convert programs from tinysynth format
 * 
*/
// {w: "sine", v: 0.2, d: 1, r: 1}
// 1: {w: "sine", v: 11, t: 3.5, d: 1, r: 1, …}

function convertTinySynthProgram(name) {
    var prog = instruments.getProg(name)
    var defs = { g: 0, w: "sine", t: 1, f: 0, v: 0.5, a: 0, h: 0.01, d: 0.01, s: 0, r: 0.05, p: 1, q: 1, k: 0 }
    var freq1 = ['t', 'f', 'p', 'q']
    var freq2 = ['t', 'f', 'p', 'q']
    var gain1 = ['v', 'a', 'h', 'd', 's', 'r', 'k']
    var gain2 = ['t', 'a', 'h', 'd', 's', 'r', 'k']
    var outputDefs = {
        w: 0, t: 1, f: 0, k: 0,
        p: 1, q: 0.1,
        v: 1, a: 0.05, h: 0.0, d: 0.1, s: 0.8, r: 0.1,
    }
    var apply = (input, output, p1, p2) => {
        p1.forEach((keyIn, i) => {
            var keyOut = p2[i]
            var diff = Math.abs(input[keyIn] - outputDefs[keyOut])
            if (diff > 0.0001) output[keyOut] = input[keyIn]
        })
    }
    var out = prog.map(p => {
        p = Object.assign({}, defs, p)
        // bake in freq multiplier for signals targeting a frequency param
        if (p.g > 0 && p.g <= 10) {
            var tgt = Object.assign({}, defs, prog[p.g - 1])
            if (!/^n/.test(tgt.w)) p.v *= tgt.t
        }
        var ret = { type: p.w, freq: {}, gain: {} }
        apply(p, ret.freq, freq1, freq2)
        apply(p, ret.gain, gain1, gain2)
        if (ret.freq.q && !ret.freq.p) delete ret.freq.q
        if (p.g > 0) ret.g = p.g
        if (p.g === 0 && ret.gain.a === 0) ret.gain.a = 0.005
        return ret
    })
    // rejigger targeted programs
    for (var i = 0; i < out.length; i++) {
        if (!out[i].g) continue
        var g = out[i].g
        var tgtProg = out[g > 10 ? g - 11 : g - 1]
        var tgtName = (g > 10) ? 'gain' : 'freq'
        var arr = tgtProg[tgtName]
        if (!Array.isArray(arr)) arr = [arr]
        delete out[i].g
        arr.push(out[i])
        tgtProg[tgtName] = arr
        out.splice(i, 1)
        i--
    }
    return out
}










/*
 * 
 *      parsing logic
 * 
*/

function stringToProgram(str) {
    // naively strip comments
    str = str.split('\n').map(line => {
        return line.replace(/\/\/.*/, '')
    }).join('\n')

    // for hacky demo convenience:
    // eval together with a `rand(a,b)` function
    var rand = (a, b) => Math.min(a, b) + Math.abs(b - a) * Math.random()
    var parsed
    try {
        parsed = eval(`var rand = ${rand};  (${str})`)
    } catch (e) { }
    var okay = !!parsed
    // var okay = parsed && parsed.length && parsed[0]
    // if (okay) parsed.forEach(o => okay = okay && (typeof o === 'object'))
    return (okay) ? parsed : null
}

function programToString(prog) {
    var s = programToString_impl(prog, 0)
    return s.split('\n').filter(s => {
        if (/^\s*(\w*:)?\s*{\s*},?\s*$/.test(s)) return false
        return true
    }).join('\n')
}

function programToString_impl(prog, depth) {
    if (depth > 10) throw '?'
    depth = depth || 0
    var indent = ''.padEnd(depth * 2, ' ')
    if (typeof prog === 'string') return `'${prog}'`
    if (typeof prog === 'number') {
        var n = Math.abs(prog)
        var rnd = (n > 10) ? 1 : (n > 1) ? 10 : (n > 0.1) ? 100 : 1000
        return '' + (Math.round(prog * rnd) / rnd)
    }
    if (!prog) return '???'
    if (Array.isArray(prog)) {
        var strs = prog.map(el => programToString_impl(el, depth + 1))
        var body = strs.join(`,\n${indent}  `)
        return `[\n${indent}  ${body},\n${indent}]`
    }
    if (prog.type) {
        var s = `{ type: '${prog.type}',\n${indent}  `
        s += Object.keys(prog).filter(k => k !== 'type').map(k => {
            return `${k}: ` + programToString_impl(prog[k], depth + 1)
        }).join(`,\n${indent}  `)
        return s + `,\n${indent}}`
    }
    return `{ ` + Object.keys(prog).map(k => {
        return `${k}:` + programToString_impl(prog[k], depth + 1)
    }).join(', ') + ` }`
}
