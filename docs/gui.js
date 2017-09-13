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
var defSig = new defs.Signal('', '', new defs.Sweep(), new defs.Envelope())


// when program text is edited
progText.oninput = function (ev) {
    var txt = ev.target.value
    var parsed
    try {
        eval('parsed = ' + txt.split('\n').join(' '))
    } catch (e) { }
    var itworked = parsed && parsed.length && parsed[0]
    if (itworked) onChange(parsed)
    progText.style.backgroundColor = (itworked) ? '#fff' : '#fee'
}


function showProgramText(prog) {
    var pared = removeDefaults(prog)
    progText.value = formatProgram(pared)
}

function removeDefaults(prog) {
    var fill = function (prop, src, tgt, def) {
        if (src[prop] === undefined) return
        if (src[prop] !== def[prop]) tgt[prop] = src[prop]
    }
    return prog.map(obj => {
        var ret = { freq: {}, gain: {} }
        sigProps.forEach(p => fill(p, obj, ret, defSig))
        sweepProps.forEach(p => fill(p, obj.freq, ret.freq, defSig.freq))
        envProps.forEach(p => fill(p, obj.freq, ret.freq, defSig.freq))
        sweepProps.forEach(p => fill(p, obj.gain, ret.gain, defSig.gain))
        envProps.forEach(p => fill(p, obj.gain, ret.gain, defSig.gain))
        return ret
    })
}



var sigProps = ['type', 'target']
var sweepProps = ['t', 'f', 'p', 'q', 'k', 'j', 'jt']
var envProps = ['v', 'a', 'h', 'd', 's', 'r', 'k']



function formatProgram(prog) {
    var lines = []
    prog.forEach(sig => {
        var line1 = '  { ' + sigProps.map(p => {
            return sig[p] ? formatProp(sig, p) : ''
        }).filter(p => p).join(', ')
        if (line1.length > 5) line1 += ', '
        var line2 = '    freq: { ' + sweepProps.map(p => {
            return formatProp(sig.freq, p)
        }).filter(p => p).join(', ') + ' }, '
        var line3 = '    gain: { ' + envProps.map(p => {
            return formatProp(sig.gain, p)
        }).filter(p => p).join(', ') + ' }  },'
        lines.push(line1, line2, line3)
    })
    lines.push(']')
    lines[0] = '[' + lines[0].substr(1)
    return lines.join('\n')
}

function formatProp(obj, p) {
    if (isNaN(obj[p]) && !obj[p]) return ''
    if (typeof obj[p] === 'number') return `${p}: ${Math.round(1000 * obj[p]) / 1000}`
    return `${p}: '${obj[p]}'`
}





