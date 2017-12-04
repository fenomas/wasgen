'use strict'


var defs = require('../src/progDefs')
var Menus = require('./menus')


module.exports = GUI



function GUI(state) {
    var self = this

    // build dat-gui menus
    var menus = new Menus()
    menus.init(document.querySelector('#menus'), 420, 4)

    // called from above when importing a preset
    this.setProgram = function (prog) {
        showProgramText(prog)
        menus.showProgram(prog)
    }

    // to be overridden from client
    this.programChanged = function (prog) { }

    // events from dat-gui
    menus.onChange = function (prog) {
        self.programChanged(prog)
        showProgramText(prog)
    }
    this.getVelocity = function () {
        return menus.getVelocity()
    }

    // set events from here elsewards
    onChange = function (prog) {
        self.programChanged(prog)
        menus.showProgram(prog)
    }

}

var onChange





/*  
 *  
 *          PROGRAM TEXT STUFF
 * 
*/

var progText = document.getElementById('progText')
var defSig = new defs.Signal('', '', 0, new defs.Sweep(), new defs.Envelope())


// when program text is edited
progText.oninput = function (ev) {
    var txt = ev.target.value
    var parsed
    try {
        eval('parsed = ' + txt.split('\n').join(' '))
    } catch (e) { }
    var okay = parsed && parsed.length && parsed[0]
    if (okay) parsed.forEach(o => okay = okay && (typeof o === 'object'))
    if (okay) onChange(parsed)
    progText.style.backgroundColor = (okay) ? '#fff' : '#fee'
}


function showProgramText(prog) {
    var pared = removeDefaults(prog)
    progText.value = formatProgram(pared)
}

function removeDefaults(prog) {
    var fill = function (prop, src, tgt, def) {
        if (!src || src[prop] === undefined) return
        if (src[prop] === '') return
        if (src[prop] !== def[prop]) tgt[prop] = src[prop]
    }
    return prog.map(obj => {
        var ret = { type: 'sine' }
        sigProps.forEach(p => fill(p, obj, ret, defSig))
        if (typeof obj.freq !== 'number') {
            ret.freq = {}
            sweepProps.forEach(p => fill(p, obj.freq, ret.freq, defSig.freq))
            envProps.forEach(p => fill(p, obj.freq, ret.freq, defSig.freq))
        } else ret.freq = obj.freq
        if (typeof obj.gain !== 'number') {
            ret.gain = {}
            sweepProps.forEach(p => fill(p, obj.gain, ret.gain, defSig.gain))
            envProps.forEach(p => fill(p, obj.gain, ret.gain, defSig.gain))
        } else ret.gain = obj.gain
        if (obj.Q) ret.Q = obj.Q
        return ret
    })
}



var sigProps = ['type', 'target', 'delay']
var sweepProps = ['t', 'f', 'p', 'q', 'k', 'j', 'jt']
var envProps = ['v', 'a', 'h', 'd', 's', 'r', 'k']



function formatProgram(prog) {
    var lines = []
    prog.forEach(sig => {
        var line1 = '  { ' + sigProps.map(p => {
            return sig[p] ? formatProp(sig, p) : ''
        }).filter(p => p).join(', ')
        if (line1.length > 5) line1 += ', '
        if (sig.Q) line1 += 'Q:' + sig.Q + ', '
        var line2 = formatLine('freq', sig, sweepProps) + ', '
        var line3 = formatLine('gain', sig, envProps) + ' }, '
        lines.push(line1, line2, line3)
    })
    lines.push(']')
    lines[0] = '[' + lines[0].substr(1)
    return lines.join('\n')
}

function formatLine(name, signal, propList) {
    if (typeof signal[name] === 'number') return `    ${name}: ${signal[name]},`
    return `    ${name}: { ` + propList.map(p => {
        return formatProp(signal[name], p)
    }).filter(p => p).join(', ') + ' }'
}

function formatProp(obj, p) {
    if (!obj) return ''
    var prop = obj[p]
    if (isNaN(prop) && !prop) return ''
    if (typeof prop === 'string') return `${p}: '${prop}'`
    if (typeof prop === 'number') return `${p}: ${round(prop)}`
    if (prop.length) return `${p}: [ ${prop.map(round).join(', ')} ]`
    return `${p}: '${obj[p]}'`
}


var round = (n) => Math.round(n * 100) / 100



